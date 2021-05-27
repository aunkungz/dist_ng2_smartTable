import { Subject } from 'rxjs';
import { Deferred, getDeepFromObject, getPageForRowIndex } from './helpers';
import { DataSet } from './data-set/data-set';
export class Grid {
    constructor(source, settings) {
        this.createFormShown = false;
        this.onSelectRowSource = new Subject();
        this.onDeselectRowSource = new Subject();
        this.setSettings(settings);
        this.setSource(source);
    }
    detach() {
        if (this.sourceOnChangedSubscription) {
            this.sourceOnChangedSubscription.unsubscribe();
        }
        if (this.sourceOnUpdatedSubscription) {
            this.sourceOnUpdatedSubscription.unsubscribe();
        }
    }
    showActionColumn(position) {
        return this.isCurrentActionsPosition(position) && this.isActionsVisible();
    }
    isCurrentActionsPosition(position) {
        return position == this.getSetting('actions.position');
    }
    isActionsVisible() {
        return this.getSetting('actions.add') || this.getSetting('actions.edit') || this.getSetting('actions.delete') || this.getSetting('actions.custom').length;
    }
    isMultiSelectVisible() {
        return this.getSetting('selectMode') === 'multi';
    }
    getNewRow() {
        return this.dataSet.newRow;
    }
    setSettings(settings) {
        this.settings = settings;
        this.dataSet = new DataSet([], this.getSetting('columns'));
        if (this.source) {
            this.source.refresh();
        }
    }
    getDataSet() {
        return this.dataSet;
    }
    setSource(source) {
        this.source = this.prepareSource(source);
        this.detach();
        this.sourceOnChangedSubscription = this.source.onChanged().subscribe((changes) => this.processDataChange(changes));
        this.sourceOnUpdatedSubscription = this.source.onUpdated().subscribe((data) => {
            const changedRow = this.dataSet.findRowByData(data);
            changedRow.setData(data);
        });
    }
    getSetting(name, defaultValue) {
        return getDeepFromObject(this.settings, name, defaultValue);
    }
    getColumns() {
        return this.dataSet.getColumns();
    }
    getRows() {
        return this.dataSet.getRows();
    }
    selectRow(row) {
        this.dataSet.selectRow(row);
    }
    multipleSelectRow(row) {
        this.dataSet.multipleSelectRow(row);
    }
    onSelectRow() {
        return this.onSelectRowSource.asObservable();
    }
    onDeselectRow() {
        return this.onDeselectRowSource.asObservable();
    }
    edit(row) {
        row.isInEditing = true;
    }
    create(row, confirmEmitter) {
        const deferred = new Deferred();
        deferred.promise.then((newData) => {
            newData = newData ? newData : row.getNewData();
            if (deferred.resolve.skipAdd) {
                this.createFormShown = false;
            }
            else {
                this.source.prepend(newData).then(() => {
                    this.createFormShown = false;
                    this.dataSet.createNewRow();
                });
            }
        }).catch((err) => {
            // doing nothing
        });
        if (this.getSetting('add.confirmCreate')) {
            confirmEmitter.emit({
                newData: row.getNewData(),
                source: this.source,
                confirm: deferred,
            });
        }
        else {
            deferred.resolve();
        }
    }
    save(row, confirmEmitter) {
        const deferred = new Deferred();
        deferred.promise.then((newData) => {
            newData = newData ? newData : row.getNewData();
            if (deferred.resolve.skipEdit) {
                row.isInEditing = false;
            }
            else {
                this.source.update(row.getData(), newData).then(() => {
                    row.isInEditing = false;
                });
            }
        }).catch((err) => {
            // doing nothing
        });
        if (this.getSetting('edit.confirmSave')) {
            confirmEmitter.emit({
                data: row.getData(),
                newData: row.getNewData(),
                source: this.source,
                confirm: deferred,
            });
        }
        else {
            deferred.resolve();
        }
    }
    delete(row, confirmEmitter) {
        const deferred = new Deferred();
        deferred.promise.then(() => {
            this.source.remove(row.getData());
        }).catch((err) => {
            // doing nothing
        });
        if (this.getSetting('delete.confirmDelete')) {
            confirmEmitter.emit({
                data: row.getData(),
                source: this.source,
                confirm: deferred,
            });
        }
        else {
            deferred.resolve();
        }
    }
    processDataChange(changes) {
        if (this.shouldProcessChange(changes)) {
            this.dataSet.setData(changes['elements']);
            if (this.getSetting('selectMode') !== 'multi') {
                const row = this.determineRowToSelect(changes);
                if (row) {
                    this.onSelectRowSource.next(row);
                }
                else {
                    this.onDeselectRowSource.next(null);
                }
            }
        }
    }
    shouldProcessChange(changes) {
        if (['filter', 'sort', 'page', 'remove', 'refresh', 'load', 'paging'].indexOf(changes['action']) !== -1) {
            return true;
        }
        else if (['prepend', 'append'].indexOf(changes['action']) !== -1 && !this.getSetting('pager.display')) {
            return true;
        }
        return false;
    }
    /**
     * @breaking-change 1.8.0
     * Need to add `| null` in return type
     *
     * TODO: move to selectable? Separate directive
     */
    determineRowToSelect(changes) {
        if (['load', 'page', 'filter', 'sort', 'refresh'].indexOf(changes['action']) !== -1) {
            return this.dataSet.select(this.getRowIndexToSelect());
        }
        if (this.shouldSkipSelection()) {
            return null;
        }
        if (changes['action'] === 'remove') {
            if (changes['elements'].length === 0) {
                // we have to store which one to select as the data will be reloaded
                this.dataSet.willSelectLastRow();
            }
            else {
                return this.dataSet.selectPreviousRow();
            }
        }
        if (changes['action'] === 'append') {
            // we have to store which one to select as the data will be reloaded
            this.dataSet.willSelectLastRow();
        }
        if (changes['action'] === 'add') {
            return this.dataSet.selectFirstRow();
        }
        if (changes['action'] === 'update') {
            return this.dataSet.selectFirstRow();
        }
        if (changes['action'] === 'prepend') {
            // we have to store which one to select as the data will be reloaded
            this.dataSet.willSelectFirstRow();
        }
        return null;
    }
    prepareSource(source) {
        const initialSource = this.getInitialSort();
        if (initialSource && initialSource['field'] && initialSource['direction']) {
            source.setSort([initialSource], false);
        }
        if (this.getSetting('pager.display') === true) {
            source.setPaging(this.getPageToSelect(source), this.getSetting('pager.perPage'), false);
        }
        source.refresh();
        return source;
    }
    getInitialSort() {
        const sortConf = {};
        this.getColumns().forEach((column) => {
            if (column.isSortable && column.defaultSortDirection) {
                sortConf['field'] = column.id;
                sortConf['direction'] = column.defaultSortDirection;
                sortConf['compare'] = column.getCompareFunction();
            }
        });
        return sortConf;
    }
    getSelectedRows() {
        return this.dataSet.getRows()
            .filter(r => r.isSelected);
    }
    selectAllRows(status) {
        this.dataSet.getRows()
            .forEach(r => r.isSelected = status);
    }
    getFirstRow() {
        return this.dataSet.getFirstRow();
    }
    getLastRow() {
        return this.dataSet.getLastRow();
    }
    getSelectionInfo() {
        const switchPageToSelectedRowPage = this.getSetting('switchPageToSelectedRowPage');
        const selectedRowIndex = Number(this.getSetting('selectedRowIndex', 0)) || 0;
        const { perPage, page } = this.getSetting('pager');
        return { perPage, page, selectedRowIndex, switchPageToSelectedRowPage };
    }
    getRowIndexToSelect() {
        const { switchPageToSelectedRowPage, selectedRowIndex, perPage } = this.getSelectionInfo();
        const dataAmount = this.source.count();
        /**
         * source - contains all table data
         * dataSet - contains data for current page
         * selectedRowIndex - contains index for data in all data
         *
         * because of that, we need to count index for a specific row in page
         * if
         * `switchPageToSelectedRowPage` - we need to change page automatically
         * `selectedRowIndex < dataAmount && selectedRowIndex >= 0` - index points to existing data
         * (if index points to non-existing data and we calculate index for current page - we will get wrong selected row.
         *  if we return index witch not points to existing data - no line will be highlighted)
         */
        return (switchPageToSelectedRowPage &&
            selectedRowIndex < dataAmount &&
            selectedRowIndex >= 0) ?
            selectedRowIndex % perPage :
            selectedRowIndex;
    }
    getPageToSelect(source) {
        const { switchPageToSelectedRowPage, selectedRowIndex, perPage, page } = this.getSelectionInfo();
        let pageToSelect = Math.max(1, page);
        if (switchPageToSelectedRowPage && selectedRowIndex >= 0) {
            pageToSelect = getPageForRowIndex(selectedRowIndex, perPage);
        }
        const maxPageAmount = Math.ceil(source.count() / perPage);
        return maxPageAmount ? Math.min(pageToSelect, maxPageAmount) : pageToSelect;
    }
    shouldSkipSelection() {
        /**
         * For backward compatibility when using `selectedRowIndex` with non-number values - ignored.
         *
         * Therefore, in order to select a row after some changes,
         * the `selectedRowIndex` value must be invalid or >= 0 (< 0 means that no row is selected).
         *
         * `Number(value)` returns `NaN` on all invalid cases, and comparisons with `NaN` always return `false`.
         *
         * !!! We should skip a row only in cases when `selectedRowIndex` < 0
         * because when < 0 all lines must be deselected
         */
        const selectedRowIndex = Number(this.getSetting('selectedRowIndex'));
        return selectedRowIndex < 0;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JpZC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvYXVuei9uZzItU21hcnRUYWJsZS9uZzItc21hcnQtdGFibGUvcHJvamVjdHMvbmcyLXNtYXJ0LXRhYmxlL3NyYy8iLCJzb3VyY2VzIjpbImxpYi9saWIvZ3JpZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFnQixNQUFNLE1BQU0sQ0FBQztBQUk3QyxPQUFPLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLGtCQUFrQixFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRzVFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUc5QyxNQUFNLE9BQU8sSUFBSTtJQWNmLFlBQVksTUFBa0IsRUFBRSxRQUFhO1FBWjdDLG9CQUFlLEdBQVksS0FBSyxDQUFDO1FBTWpDLHNCQUFpQixHQUFHLElBQUksT0FBTyxFQUFPLENBQUM7UUFDdkMsd0JBQW1CLEdBQUcsSUFBSSxPQUFPLEVBQU8sQ0FBQztRQU12QyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNCLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVELE1BQU07UUFDSixJQUFJLElBQUksQ0FBQywyQkFBMkIsRUFBRTtZQUNwQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDaEQ7UUFDRCxJQUFJLElBQUksQ0FBQywyQkFBMkIsRUFBRTtZQUNwQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsV0FBVyxFQUFFLENBQUM7U0FDaEQ7SUFDSCxDQUFDO0lBRUQsZ0JBQWdCLENBQUMsUUFBZ0I7UUFDL0IsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDNUUsQ0FBQztJQUVELHdCQUF3QixDQUFDLFFBQWdCO1FBQ3ZDLE9BQU8sUUFBUSxJQUFJLElB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OUIsQ0FBQztDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3ViamVjdCwgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgRGVmZXJyZWQsIGdldERlZXBGcm9tT2JqZWN0LCBnZXRQYWdlRm9yUm93SW5kZXggfSBmcm9tICcuL2hlbHBlcnMnO1xuaW1wb3J0IHsgQ29sdW1uIH0gZnJvbSAnLi9kYXRhLXNldC9jb2x1bW4nO1xuaW1wb3J0IHsgUm93IH0gZnJvbSAnLi9kYXRhLXNldC9yb3cnO1xuaW1wb3J0IHsgRGF0YVNldCB9IGZyb20gJy4vZGF0YS1zZXQvZGF0YS1zZXQnO1xuaW1wb3J0IHsgRGF0YVNvdXJjZSB9IGZyb20gJy4vZGF0YS1zb3VyY2UvZGF0YS1zb3VyY2UnO1xuXG5leHBvcnQgY2xhc3MgR3JpZCB7XG5cbiAgY3JlYXRlRm9ybVNob3duOiBib29sZWFuID0gZmFsc2U7XG5cbiAgc291cmNlOiBEYXRhU291cmNlO1xuICBzZXR0aW5nczogYW55O1xuICBkYXRhU2V0OiBEYXRhU2V0O1xuXG4gIG9uU2VsZWN0Um93U291cmNlID0gbmV3IFN1YmplY3Q8YW55PigpO1xuICBvbkRlc2VsZWN0Um93U291cmNlID0gbmV3IFN1YmplY3Q8YW55PigpO1xuXG4gIHByaXZhdGUgc291cmNlT25DaGFuZ2VkU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG4gIHByaXZhdGUgc291cmNlT25VcGRhdGVkU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XG5cbiAgY29uc3RydWN0b3Ioc291cmNlOiBEYXRhU291cmNlLCBzZXR0aW5nczogYW55KSB7XG4gICAgdGhpcy5zZXRTZXR0aW5ncyhzZXR0aW5ncyk7XG4gICAgdGhpcy5zZXRTb3VyY2Uoc291cmNlKTtcbiAgfVxuXG4gIGRldGFjaCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zb3VyY2VPbkNoYW5nZWRTdWJzY3JpcHRpb24pIHtcbiAgICAgIHRoaXMuc291cmNlT25DaGFuZ2VkU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnNvdXJjZU9uVXBkYXRlZFN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5zb3VyY2VPblVwZGF0ZWRTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB9XG4gIH1cblxuICBzaG93QWN0aW9uQ29sdW1uKHBvc2l0aW9uOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5pc0N1cnJlbnRBY3Rpb25zUG9zaXRpb24ocG9zaXRpb24pICYmIHRoaXMuaXNBY3Rpb25zVmlzaWJsZSgpO1xuICB9XG5cbiAgaXNDdXJyZW50QWN0aW9uc1Bvc2l0aW9uKHBvc2l0aW9uOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gcG9zaXRpb24gPT0gdGhpcy5nZXRTZXR0aW5nKCdhY3Rpb25zLnBvc2l0aW9uJyk7XG4gIH1cblxuICBpc0FjdGlvbnNWaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldFNldHRpbmcoJ2FjdGlvbnMuYWRkJykgfHwgdGhpcy5nZXRTZXR0aW5nKCdhY3Rpb25zLmVkaXQnKSB8fCB0aGlzLmdldFNldHRpbmcoJ2FjdGlvbnMuZGVsZXRlJykgfHwgdGhpcy5nZXRTZXR0aW5nKCdhY3Rpb25zLmN1c3RvbScpLmxlbmd0aDtcbiAgfVxuXG4gIGlzTXVsdGlTZWxlY3RWaXNpYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdldFNldHRpbmcoJ3NlbGVjdE1vZGUnKSA9PT0gJ211bHRpJztcbiAgfVxuXG4gIGdldE5ld1JvdygpOiBSb3cge1xuICAgIHJldHVybiB0aGlzLmRhdGFTZXQubmV3Um93O1xuICB9XG5cbiAgc2V0U2V0dGluZ3Moc2V0dGluZ3M6IE9iamVjdCkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB0aGlzLmRhdGFTZXQgPSBuZXcgRGF0YVNldChbXSwgdGhpcy5nZXRTZXR0aW5nKCdjb2x1bW5zJykpO1xuXG4gICAgaWYgKHRoaXMuc291cmNlKSB7XG4gICAgICB0aGlzLnNvdXJjZS5yZWZyZXNoKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0RGF0YVNldCgpOiBEYXRhU2V0IHtcbiAgICByZXR1cm4gdGhpcy5kYXRhU2V0O1xuICB9XG5cbiAgc2V0U291cmNlKHNvdXJjZTogRGF0YVNvdXJjZSkge1xuICAgIHRoaXMuc291cmNlID0gdGhpcy5wcmVwYXJlU291cmNlKHNvdXJjZSk7XG4gICAgdGhpcy5kZXRhY2goKTtcblxuICAgIHRoaXMuc291cmNlT25DaGFuZ2VkU3Vic2NyaXB0aW9uID0gdGhpcy5zb3VyY2Uub25DaGFuZ2VkKCkuc3Vic2NyaWJlKChjaGFuZ2VzOiBhbnkpID0+IHRoaXMucHJvY2Vzc0RhdGFDaGFuZ2UoY2hhbmdlcykpO1xuXG4gICAgdGhpcy5zb3VyY2VPblVwZGF0ZWRTdWJzY3JpcHRpb24gPSB0aGlzLnNvdXJjZS5vblVwZGF0ZWQoKS5zdWJzY3JpYmUoKGRhdGE6IGFueSkgPT4ge1xuICAgICAgY29uc3QgY2hhbmdlZFJvdyA9IHRoaXMuZGF0YVNldC5maW5kUm93QnlEYXRhKGRhdGEpO1xuICAgICAgY2hhbmdlZFJvdy5zZXREYXRhKGRhdGEpO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0U2V0dGluZyhuYW1lOiBzdHJpbmcsIGRlZmF1bHRWYWx1ZT86IGFueSk6IGFueSB7XG4gICAgcmV0dXJuIGdldERlZXBGcm9tT2JqZWN0KHRoaXMuc2V0dGluZ3MsIG5hbWUsIGRlZmF1bHRWYWx1ZSk7XG4gIH1cblxuICBnZXRDb2x1bW5zKCk6IEFycmF5PENvbHVtbj4ge1xuICAgIHJldHVybiB0aGlzLmRhdGFTZXQuZ2V0Q29sdW1ucygpO1xuICB9XG5cbiAgZ2V0Um93cygpOiBBcnJheTxSb3c+IHtcbiAgICByZXR1cm4gdGhpcy5kYXRhU2V0LmdldFJvd3MoKTtcbiAgfVxuXG4gIHNlbGVjdFJvdyhyb3c6IFJvdykge1xuICAgIHRoaXMuZGF0YVNldC5zZWxlY3RSb3cocm93KTtcbiAgfVxuXG4gIG11bHRpcGxlU2VsZWN0Um93KHJvdzogUm93KSB7XG4gICAgdGhpcy5kYXRhU2V0Lm11bHRpcGxlU2VsZWN0Um93KHJvdyk7XG4gIH1cblxuICBvblNlbGVjdFJvdygpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLm9uU2VsZWN0Um93U291cmNlLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgb25EZXNlbGVjdFJvdygpOiBPYnNlcnZhYmxlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLm9uRGVzZWxlY3RSb3dTb3VyY2UuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBlZGl0KHJvdzogUm93KSB7XG4gICAgcm93LmlzSW5FZGl0aW5nID0gdHJ1ZTtcbiAgfVxuXG4gIGNyZWF0ZShyb3c6IFJvdywgY29uZmlybUVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+KSB7XG5cbiAgICBjb25zdCBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAgIGRlZmVycmVkLnByb21pc2UudGhlbigobmV3RGF0YSkgPT4ge1xuICAgICAgbmV3RGF0YSA9IG5ld0RhdGEgPyBuZXdEYXRhIDogcm93LmdldE5ld0RhdGEoKTtcbiAgICAgIGlmIChkZWZlcnJlZC5yZXNvbHZlLnNraXBBZGQpIHtcbiAgICAgICAgdGhpcy5jcmVhdGVGb3JtU2hvd24gPSBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc291cmNlLnByZXBlbmQobmV3RGF0YSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5jcmVhdGVGb3JtU2hvd24gPSBmYWxzZTtcbiAgICAgICAgICB0aGlzLmRhdGFTZXQuY3JlYXRlTmV3Um93KCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIC8vIGRvaW5nIG5vdGhpbmdcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLmdldFNldHRpbmcoJ2FkZC5jb25maXJtQ3JlYXRlJykpIHtcbiAgICAgIGNvbmZpcm1FbWl0dGVyLmVtaXQoe1xuICAgICAgICBuZXdEYXRhOiByb3cuZ2V0TmV3RGF0YSgpLFxuICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICBjb25maXJtOiBkZWZlcnJlZCxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgfVxuICB9XG5cbiAgc2F2ZShyb3c6IFJvdywgY29uZmlybUVtaXR0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+KSB7XG5cbiAgICBjb25zdCBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuICAgIGRlZmVycmVkLnByb21pc2UudGhlbigobmV3RGF0YSkgPT4ge1xuICAgICAgbmV3RGF0YSA9IG5ld0RhdGEgPyBuZXdEYXRhIDogcm93LmdldE5ld0RhdGEoKTtcbiAgICAgIGlmIChkZWZlcnJlZC5yZXNvbHZlLnNraXBFZGl0KSB7XG4gICAgICAgIHJvdy5pc0luRWRpdGluZyA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zb3VyY2UudXBkYXRlKHJvdy5nZXREYXRhKCksIG5ld0RhdGEpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJvdy5pc0luRWRpdGluZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAvLyBkb2luZyBub3RoaW5nXG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5nZXRTZXR0aW5nKCdlZGl0LmNvbmZpcm1TYXZlJykpIHtcbiAgICAgIGNvbmZpcm1FbWl0dGVyLmVtaXQoe1xuICAgICAgICBkYXRhOiByb3cuZ2V0RGF0YSgpLFxuICAgICAgICBuZXdEYXRhOiByb3cuZ2V0TmV3RGF0YSgpLFxuICAgICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgICBjb25maXJtOiBkZWZlcnJlZCxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgfVxuICB9XG5cbiAgZGVsZXRlKHJvdzogUm93LCBjb25maXJtRW1pdHRlcjogRXZlbnRFbWl0dGVyPGFueT4pIHtcblxuICAgIGNvbnN0IGRlZmVycmVkID0gbmV3IERlZmVycmVkKCk7XG4gICAgZGVmZXJyZWQucHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgIHRoaXMuc291cmNlLnJlbW92ZShyb3cuZ2V0RGF0YSgpKTtcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAvLyBkb2luZyBub3RoaW5nXG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5nZXRTZXR0aW5nKCdkZWxldGUuY29uZmlybURlbGV0ZScpKSB7XG4gICAgICBjb25maXJtRW1pdHRlci5lbWl0KHtcbiAgICAgICAgZGF0YTogcm93LmdldERhdGEoKSxcbiAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZSxcbiAgICAgICAgY29uZmlybTogZGVmZXJyZWQsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3NEYXRhQ2hhbmdlKGNoYW5nZXM6IGFueSkge1xuICAgIGlmICh0aGlzLnNob3VsZFByb2Nlc3NDaGFuZ2UoY2hhbmdlcykpIHtcbiAgICAgIHRoaXMuZGF0YVNldC5zZXREYXRhKGNoYW5nZXNbJ2VsZW1lbnRzJ10pO1xuICAgICAgaWYgKHRoaXMuZ2V0U2V0dGluZygnc2VsZWN0TW9kZScpICE9PSAnbXVsdGknKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZGV0ZXJtaW5lUm93VG9TZWxlY3QoY2hhbmdlcyk7XG5cbiAgICAgICAgaWYgKHJvdykge1xuICAgICAgICAgIHRoaXMub25TZWxlY3RSb3dTb3VyY2UubmV4dChyb3cpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMub25EZXNlbGVjdFJvd1NvdXJjZS5uZXh0KG51bGwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2hvdWxkUHJvY2Vzc0NoYW5nZShjaGFuZ2VzOiBhbnkpOiBib29sZWFuIHtcbiAgICBpZiAoWydmaWx0ZXInLCAnc29ydCcsICdwYWdlJywgJ3JlbW92ZScsICdyZWZyZXNoJywgJ2xvYWQnLCAncGFnaW5nJ10uaW5kZXhPZihjaGFuZ2VzWydhY3Rpb24nXSkgIT09IC0xKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKFsncHJlcGVuZCcsICdhcHBlbmQnXS5pbmRleE9mKGNoYW5nZXNbJ2FjdGlvbiddKSAhPT0gLTEgJiYgIXRoaXMuZ2V0U2V0dGluZygncGFnZXIuZGlzcGxheScpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogQGJyZWFraW5nLWNoYW5nZSAxLjguMFxuICAgKiBOZWVkIHRvIGFkZCBgfCBudWxsYCBpbiByZXR1cm4gdHlwZVxuICAgKlxuICAgKiBUT0RPOiBtb3ZlIHRvIHNlbGVjdGFibGU/IFNlcGFyYXRlIGRpcmVjdGl2ZVxuICAgKi9cbiAgZGV0ZXJtaW5lUm93VG9TZWxlY3QoY2hhbmdlczogYW55KTogUm93IHtcblxuICAgIGlmIChbJ2xvYWQnLCAncGFnZScsICdmaWx0ZXInLCAnc29ydCcsICdyZWZyZXNoJ10uaW5kZXhPZihjaGFuZ2VzWydhY3Rpb24nXSkgIT09IC0xKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhU2V0LnNlbGVjdCh0aGlzLmdldFJvd0luZGV4VG9TZWxlY3QoKSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2hvdWxkU2tpcFNlbGVjdGlvbigpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoY2hhbmdlc1snYWN0aW9uJ10gPT09ICdyZW1vdmUnKSB7XG4gICAgICBpZiAoY2hhbmdlc1snZWxlbWVudHMnXS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gd2UgaGF2ZSB0byBzdG9yZSB3aGljaCBvbmUgdG8gc2VsZWN0IGFzIHRoZSBkYXRhIHdpbGwgYmUgcmVsb2FkZWRcbiAgICAgICAgdGhpcy5kYXRhU2V0LndpbGxTZWxlY3RMYXN0Um93KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhU2V0LnNlbGVjdFByZXZpb3VzUm93KCk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChjaGFuZ2VzWydhY3Rpb24nXSA9PT0gJ2FwcGVuZCcpIHtcbiAgICAgIC8vIHdlIGhhdmUgdG8gc3RvcmUgd2hpY2ggb25lIHRvIHNlbGVjdCBhcyB0aGUgZGF0YSB3aWxsIGJlIHJlbG9hZGVkXG4gICAgICB0aGlzLmRhdGFTZXQud2lsbFNlbGVjdExhc3RSb3coKTtcbiAgICB9XG4gICAgaWYgKGNoYW5nZXNbJ2FjdGlvbiddID09PSAnYWRkJykge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YVNldC5zZWxlY3RGaXJzdFJvdygpO1xuICAgIH1cbiAgICBpZiAoY2hhbmdlc1snYWN0aW9uJ10gPT09ICd1cGRhdGUnKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhU2V0LnNlbGVjdEZpcnN0Um93KCk7XG4gICAgfVxuICAgIGlmIChjaGFuZ2VzWydhY3Rpb24nXSA9PT0gJ3ByZXBlbmQnKSB7XG4gICAgICAvLyB3ZSBoYXZlIHRvIHN0b3JlIHdoaWNoIG9uZSB0byBzZWxlY3QgYXMgdGhlIGRhdGEgd2lsbCBiZSByZWxvYWRlZFxuICAgICAgdGhpcy5kYXRhU2V0LndpbGxTZWxlY3RGaXJzdFJvdygpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHByZXBhcmVTb3VyY2Uoc291cmNlOiBhbnkpOiBEYXRhU291cmNlIHtcbiAgICBjb25zdCBpbml0aWFsU291cmNlOiBhbnkgPSB0aGlzLmdldEluaXRpYWxTb3J0KCk7XG4gICAgaWYgKGluaXRpYWxTb3VyY2UgJiYgaW5pdGlhbFNvdXJjZVsnZmllbGQnXSAmJiBpbml0aWFsU291cmNlWydkaXJlY3Rpb24nXSkge1xuICAgICAgc291cmNlLnNldFNvcnQoW2luaXRpYWxTb3VyY2VdLCBmYWxzZSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmdldFNldHRpbmcoJ3BhZ2VyLmRpc3BsYXknKSA9PT0gdHJ1ZSkge1xuICAgICAgc291cmNlLnNldFBhZ2luZyh0aGlzLmdldFBhZ2VUb1NlbGVjdChzb3VyY2UpLCB0aGlzLmdldFNldHRpbmcoJ3BhZ2VyLnBlclBhZ2UnKSwgZmFsc2UpO1xuICAgIH1cblxuICAgIHNvdXJjZS5yZWZyZXNoKCk7XG4gICAgcmV0dXJuIHNvdXJjZTtcbiAgfVxuXG4gIGdldEluaXRpYWxTb3J0KCkge1xuICAgIGNvbnN0IHNvcnRDb25mOiBhbnkgPSB7fTtcbiAgICB0aGlzLmdldENvbHVtbnMoKS5mb3JFYWNoKChjb2x1bW46IENvbHVtbikgPT4ge1xuICAgICAgaWYgKGNvbHVtbi5pc1NvcnRhYmxlICYmIGNvbHVtbi5kZWZhdWx0U29ydERpcmVjdGlvbikge1xuICAgICAgICBzb3J0Q29uZlsnZmllbGQnXSA9IGNvbHVtbi5pZDtcbiAgICAgICAgc29ydENvbmZbJ2RpcmVjdGlvbiddID0gY29sdW1uLmRlZmF1bHRTb3J0RGlyZWN0aW9uO1xuICAgICAgICBzb3J0Q29uZlsnY29tcGFyZSddID0gY29sdW1uLmdldENvbXBhcmVGdW5jdGlvbigpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBzb3J0Q29uZjtcbiAgfVxuXG4gIGdldFNlbGVjdGVkUm93cygpOiBBcnJheTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5kYXRhU2V0LmdldFJvd3MoKVxuICAgICAgLmZpbHRlcihyID0+IHIuaXNTZWxlY3RlZCk7XG4gIH1cblxuICBzZWxlY3RBbGxSb3dzKHN0YXR1czogYW55KSB7XG4gICAgdGhpcy5kYXRhU2V0LmdldFJvd3MoKVxuICAgICAgLmZvckVhY2gociA9PiByLmlzU2VsZWN0ZWQgPSBzdGF0dXMpO1xuICB9XG5cbiAgZ2V0Rmlyc3RSb3coKTogUm93IHtcbiAgICByZXR1cm4gdGhpcy5kYXRhU2V0LmdldEZpcnN0Um93KCk7XG4gIH1cblxuICBnZXRMYXN0Um93KCk6IFJvdyB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YVNldC5nZXRMYXN0Um93KCk7XG4gIH1cblxuICBwcml2YXRlIGdldFNlbGVjdGlvbkluZm8oKTogeyBwZXJQYWdlOiBudW1iZXIsIHBhZ2U6IG51bWJlciwgc2VsZWN0ZWRSb3dJbmRleDogbnVtYmVyLCBzd2l0Y2hQYWdlVG9TZWxlY3RlZFJvd1BhZ2U6IGJvb2xlYW4gfSB7XG4gICAgY29uc3Qgc3dpdGNoUGFnZVRvU2VsZWN0ZWRSb3dQYWdlOiBib29sZWFuID0gdGhpcy5nZXRTZXR0aW5nKCdzd2l0Y2hQYWdlVG9TZWxlY3RlZFJvd1BhZ2UnKTtcbiAgICBjb25zdCBzZWxlY3RlZFJvd0luZGV4OiBudW1iZXIgPSBOdW1iZXIodGhpcy5nZXRTZXR0aW5nKCdzZWxlY3RlZFJvd0luZGV4JywgMCkpIHx8IDA7XG4gICAgY29uc3QgeyBwZXJQYWdlLCBwYWdlIH06IHsgcGVyUGFnZTogbnVtYmVyLCBwYWdlOiBudW1iZXIgfSA9IHRoaXMuZ2V0U2V0dGluZygncGFnZXInKTtcbiAgICByZXR1cm4geyBwZXJQYWdlLCBwYWdlLCBzZWxlY3RlZFJvd0luZGV4LCBzd2l0Y2hQYWdlVG9TZWxlY3RlZFJvd1BhZ2UgfTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0Um93SW5kZXhUb1NlbGVjdCgpOiBudW1iZXIge1xuICAgIGNvbnN0IHsgc3dpdGNoUGFnZVRvU2VsZWN0ZWRSb3dQYWdlLCBzZWxlY3RlZFJvd0luZGV4LCBwZXJQYWdlIH0gPSB0aGlzLmdldFNlbGVjdGlvbkluZm8oKTtcbiAgICBjb25zdCBkYXRhQW1vdW50OiBudW1iZXIgPSB0aGlzLnNvdXJjZS5jb3VudCgpO1xuICAgIC8qKlxuICAgICAqIHNvdXJjZSAtIGNvbnRhaW5zIGFsbCB0YWJsZSBkYXRhXG4gICAgICogZGF0YVNldCAtIGNvbnRhaW5zIGRhdGEgZm9yIGN1cnJlbnQgcGFnZVxuICAgICAqIHNlbGVjdGVkUm93SW5kZXggLSBjb250YWlucyBpbmRleCBmb3IgZGF0YSBpbiBhbGwgZGF0YVxuICAgICAqXG4gICAgICogYmVjYXVzZSBvZiB0aGF0LCB3ZSBuZWVkIHRvIGNvdW50IGluZGV4IGZvciBhIHNwZWNpZmljIHJvdyBpbiBwYWdlXG4gICAgICogaWZcbiAgICAgKiBgc3dpdGNoUGFnZVRvU2VsZWN0ZWRSb3dQYWdlYCAtIHdlIG5lZWQgdG8gY2hhbmdlIHBhZ2UgYXV0b21hdGljYWxseVxuICAgICAqIGBzZWxlY3RlZFJvd0luZGV4IDwgZGF0YUFtb3VudCAmJiBzZWxlY3RlZFJvd0luZGV4ID49IDBgIC0gaW5kZXggcG9pbnRzIHRvIGV4aXN0aW5nIGRhdGFcbiAgICAgKiAoaWYgaW5kZXggcG9pbnRzIHRvIG5vbi1leGlzdGluZyBkYXRhIGFuZCB3ZSBjYWxjdWxhdGUgaW5kZXggZm9yIGN1cnJlbnQgcGFnZSAtIHdlIHdpbGwgZ2V0IHdyb25nIHNlbGVjdGVkIHJvdy5cbiAgICAgKiAgaWYgd2UgcmV0dXJuIGluZGV4IHdpdGNoIG5vdCBwb2ludHMgdG8gZXhpc3RpbmcgZGF0YSAtIG5vIGxpbmUgd2lsbCBiZSBoaWdobGlnaHRlZClcbiAgICAgKi9cbiAgICByZXR1cm4gKFxuICAgICAgc3dpdGNoUGFnZVRvU2VsZWN0ZWRSb3dQYWdlICYmXG4gICAgICBzZWxlY3RlZFJvd0luZGV4IDwgZGF0YUFtb3VudCAmJlxuICAgICAgc2VsZWN0ZWRSb3dJbmRleCA+PSAwXG4gICAgKSA/XG4gICAgICBzZWxlY3RlZFJvd0luZGV4ICUgcGVyUGFnZSA6XG4gICAgICBzZWxlY3RlZFJvd0luZGV4O1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRQYWdlVG9TZWxlY3Qoc291cmNlOiBEYXRhU291cmNlKTogbnVtYmVyIHtcbiAgICBjb25zdCB7IHN3aXRjaFBhZ2VUb1NlbGVjdGVkUm93UGFnZSwgc2VsZWN0ZWRSb3dJbmRleCwgcGVyUGFnZSwgcGFnZSB9ID0gdGhpcy5nZXRTZWxlY3Rpb25JbmZvKCk7XG4gICAgbGV0IHBhZ2VUb1NlbGVjdDogbnVtYmVyID0gTWF0aC5tYXgoMSwgcGFnZSk7XG4gICAgaWYgKHN3aXRjaFBhZ2VUb1NlbGVjdGVkUm93UGFnZSAmJiBzZWxlY3RlZFJvd0luZGV4ID49IDApIHtcbiAgICAgIHBhZ2VUb1NlbGVjdCA9IGdldFBhZ2VGb3JSb3dJbmRleChzZWxlY3RlZFJvd0luZGV4LCBwZXJQYWdlKTtcbiAgICB9XG4gICAgY29uc3QgbWF4UGFnZUFtb3VudDogbnVtYmVyID0gTWF0aC5jZWlsKHNvdXJjZS5jb3VudCgpIC8gcGVyUGFnZSk7XG4gICAgcmV0dXJuIG1heFBhZ2VBbW91bnQgPyBNYXRoLm1pbihwYWdlVG9TZWxlY3QsIG1heFBhZ2VBbW91bnQpIDogcGFnZVRvU2VsZWN0O1xuICB9XG5cbiAgcHJpdmF0ZSBzaG91bGRTa2lwU2VsZWN0aW9uKCk6IGJvb2xlYW4ge1xuICAgIC8qKlxuICAgICAqIEZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IHdoZW4gdXNpbmcgYHNlbGVjdGVkUm93SW5kZXhgIHdpdGggbm9uLW51bWJlciB2YWx1ZXMgLSBpZ25vcmVkLlxuICAgICAqXG4gICAgICogVGhlcmVmb3JlLCBpbiBvcmRlciB0byBzZWxlY3QgYSByb3cgYWZ0ZXIgc29tZSBjaGFuZ2VzLFxuICAgICAqIHRoZSBgc2VsZWN0ZWRSb3dJbmRleGAgdmFsdWUgbXVzdCBiZSBpbnZhbGlkIG9yID49IDAgKDwgMCBtZWFucyB0aGF0IG5vIHJvdyBpcyBzZWxlY3RlZCkuXG4gICAgICpcbiAgICAgKiBgTnVtYmVyKHZhbHVlKWAgcmV0dXJucyBgTmFOYCBvbiBhbGwgaW52YWxpZCBjYXNlcywgYW5kIGNvbXBhcmlzb25zIHdpdGggYE5hTmAgYWx3YXlzIHJldHVybiBgZmFsc2VgLlxuICAgICAqXG4gICAgICogISEhIFdlIHNob3VsZCBza2lwIGEgcm93IG9ubHkgaW4gY2FzZXMgd2hlbiBgc2VsZWN0ZWRSb3dJbmRleGAgPCAwXG4gICAgICogYmVjYXVzZSB3aGVuIDwgMCBhbGwgbGluZXMgbXVzdCBiZSBkZXNlbGVjdGVkXG4gICAgICovXG4gICAgY29uc3Qgc2VsZWN0ZWRSb3dJbmRleCA9IE51bWJlcih0aGlzLmdldFNldHRpbmcoJ3NlbGVjdGVkUm93SW5kZXgnKSk7XG4gICAgcmV0dXJuIHNlbGVjdGVkUm93SW5kZXggPCAwO1xuICB9XG59XG4iXX0=