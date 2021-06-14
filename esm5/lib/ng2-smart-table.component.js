import * as tslib_1 from "tslib";
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Grid } from './lib/grid';
import { DataSource } from './lib/data-source/data-source';
import { deepExtend } from './lib/helpers';
import { LocalDataSource } from './lib/data-source/local/local.data-source';
var Ng2SmartTableComponent = /** @class */ (function () {
    function Ng2SmartTableComponent() {
        this.settings = {};
        this.rowSelect = new EventEmitter();
        this.userRowSelect = new EventEmitter();
        this.delete = new EventEmitter();
        this.edit = new EventEmitter();
        this.create = new EventEmitter();
        this.custom = new EventEmitter();
        this.deleteConfirm = new EventEmitter();
        this.editConfirm = new EventEmitter();
        this.createConfirm = new EventEmitter();
        this.rowHover = new EventEmitter();
        this.defaultSettings = {
            mode: 'inline',
            selectMode: 'single',
            hideHeader: false,
            hideSubHeader: false,
            actions: {
                columnTitle: 'Actions',
                add: true,
                edit: true,
                delete: true,
                custom: [],
                position: 'left',
            },
            filter: {
                inputClass: '',
            },
            edit: {
                inputClass: '',
                editButtonContent: 'Edit',
                saveButtonContent: 'Update',
                cancelButtonContent: 'Cancel',
                confirmSave: false,
            },
            add: {
                inputClass: '',
                addButtonContent: 'Add New',
                createButtonContent: 'Create',
                cancelButtonContent: 'Cancel',
                confirmCreate: false,
            },
            delete: {
                deleteButtonContent: 'Delete',
                confirmDelete: false,
            },
            attr: {
                id: '',
                class: '',
            },
            noDataMessage: 'No data found',
            columns: {},
            pager: {
                display: true,
                perPage: 10,
                paginateSize: 4,
                hasJumpToPage: true
            },
            rowClassFunction: function () { return ""; }
        };
        this.isAllSelected = false;
    }
    Ng2SmartTableComponent.prototype.ngOnChanges = function (changes) {
        if (this.grid) {
            if (changes['settings']) {
                this.grid.setSettings(this.prepareSettings());
            }
            if (changes['source']) {
                this.source = this.prepareSource();
                this.grid.setSource(this.source);
            }
        }
        else {
            this.initGrid();
        }
        this.tableId = this.grid.getSetting('attr.id');
        this.tableClass = this.grid.getSetting('attr.class');
        this.isHideHeader = this.grid.getSetting('hideHeader');
        this.isHideSubHeader = this.grid.getSetting('hideSubHeader');
        this.isPagerDisplay = this.grid.getSetting('pager.display');
        this.isPagerDisplay = this.grid.getSetting('pager.display');
        this.perPageSelect = this.grid.getSetting('pager.perPageSelect');
        this.rowClassFunction = this.grid.getSetting('rowClassFunction');
        this.paginateSize = this.grid.getSetting('paginateSize');
        this.hasJumpToPage = this.grid.getSetting('hasJumpToPage');
    };
    Ng2SmartTableComponent.prototype.editRowSelect = function (row) {
        if (this.grid.getSetting('selectMode') === 'multi') {
            this.onMultipleSelectRow(row);
        }
        else {
            this.onSelectRow(row);
        }
    };
    Ng2SmartTableComponent.prototype.onUserSelectRow = function (row) {
        if (this.grid.getSetting('selectMode') !== 'multi') {
            this.grid.selectRow(row);
            this.emitUserSelectRow(row);
            this.emitSelectRow(row);
        }
    };
    Ng2SmartTableComponent.prototype.onRowHover = function (row) {
        this.rowHover.emit(row);
    };
    Ng2SmartTableComponent.prototype.multipleSelectRow = function (row) {
        this.grid.multipleSelectRow(row);
        this.emitUserSelectRow(row);
        this.emitSelectRow(row);
    };
    Ng2SmartTableComponent.prototype.onSelectAllRows = function ($event) {
        this.isAllSelected = !this.isAllSelected;
        this.grid.selectAllRows(this.isAllSelected);
        this.emitUserSelectRow(null);
        this.emitSelectRow(null);
    };
    Ng2SmartTableComponent.prototype.onSelectRow = function (row) {
        this.grid.selectRow(row);
        this.emitSelectRow(row);
    };
    Ng2SmartTableComponent.prototype.onMultipleSelectRow = function (row) {
        this.emitSelectRow(row);
    };
    Ng2SmartTableComponent.prototype.initGrid = function () {
        var _this = this;
        this.source = this.prepareSource();
        this.grid = new Grid(this.source, this.prepareSettings());
        this.grid.onSelectRow().subscribe(function (row) { return _this.emitSelectRow(row); });
    };
    Ng2SmartTableComponent.prototype.prepareSource = function () {
        if (this.source instanceof DataSource) {
            return this.source;
        }
        else if (this.source instanceof Array) {
            return new LocalDataSource(this.source);
        }
        return new LocalDataSource();
    };
    Ng2SmartTableComponent.prototype.prepareSettings = function () {
        return deepExtend({}, this.defaultSettings, this.settings);
    };
    Ng2SmartTableComponent.prototype.changePage = function ($event) {
        this.resetAllSelector();
    };
    Ng2SmartTableComponent.prototype.sort = function ($event) {
        this.resetAllSelector();
    };
    Ng2SmartTableComponent.prototype.filter = function ($event) {
        this.resetAllSelector();
    };
    Ng2SmartTableComponent.prototype.resetAllSelector = function () {
        this.isAllSelected = false;
    };
    Ng2SmartTableComponent.prototype.emitUserSelectRow = function (row) {
        var selectedRows = this.grid.getSelectedRows();
        this.userRowSelect.emit({
            data: row ? row.getData() : null,
            isSelected: row ? row.getIsSelected() : null,
            source: this.source,
            selected: selectedRows && selectedRows.length ? selectedRows.map(function (r) { return r.getData(); }) : [],
        });
    };
    Ng2SmartTableComponent.prototype.emitSelectRow = function (row) {
        this.rowSelect.emit({
            data: row ? row.getData() : null,
            isSelected: row ? row.getIsSelected() : null,
            source: this.source,
        });
    };
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], Ng2SmartTableComponent.prototype, "source", void 0);
    tslib_1.__decorate([
        Input(),
        tslib_1.__metadata("design:type", Object)
    ], Ng2SmartTableComponent.prototype, "settings", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], Ng2SmartTableComponent.prototype, "rowSelect", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], Ng2SmartTableComponent.prototype, "userRowSelect", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], Ng2SmartTableComponent.prototype, "delete", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], Ng2SmartTableComponent.prototype, "edit", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], Ng2SmartTableComponent.prototype, "create", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], Ng2SmartTableComponent.prototype, "custom", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], Ng2SmartTableComponent.prototype, "deleteConfirm", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], Ng2SmartTableComponent.prototype, "editConfirm", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", Object)
    ], Ng2SmartTableComponent.prototype, "createConfirm", void 0);
    tslib_1.__decorate([
        Output(),
        tslib_1.__metadata("design:type", EventEmitter)
    ], Ng2SmartTableComponent.prototype, "rowHover", void 0);
    Ng2SmartTableComponent = tslib_1.__decorate([
        Component({
            selector: 'ng2-smart-table',
            template: "<table [id]=\"tableId\" [ngClass]=\"tableClass\">\n\n  <thead ng2-st-thead *ngIf=\"!isHideHeader || !isHideSubHeader\"\n                      [grid]=\"grid\"\n                      [isAllSelected]=\"isAllSelected\"\n                      [source]=\"source\"\n                      [createConfirm]=\"createConfirm\"\n                      (create)=\"create.emit($event)\"\n                      (selectAllRows)=\"onSelectAllRows($event)\"\n                      (sort)=\"sort($event)\"\n                      (filter)=\"filter($event)\">\n  </thead>\n\n  <tbody ng2-st-tbody [grid]=\"grid\"\n                      [source]=\"source\"\n                      [deleteConfirm]=\"deleteConfirm\"\n                      [editConfirm]=\"editConfirm\"\n                      [rowClassFunction]=\"rowClassFunction\"\n                      (edit)=\"edit.emit($event)\"\n                      (delete)=\"delete.emit($event)\"\n                      (custom)=\"custom.emit($event)\"\n                      (userSelectRow)=\"onUserSelectRow($event)\"\n                      (editRowSelect)=\"editRowSelect($event)\"\n                      (multipleSelectRow)=\"multipleSelectRow($event)\"\n                      (rowHover)=\"onRowHover($event)\">\n  </tbody>\n\n</table>\n\n<ng2-smart-table-pager *ngIf=\"isPagerDisplay\"\n                        [source]=\"source\"\n                        [perPageSelect]=\"perPageSelect\"\n                        [paginateSize]=\"paginateSize\"\n                        [hasJumpToPage]=\"hasJumpToPage\"\n                        (changePage)=\"changePage($event)\">\n</ng2-smart-table-pager>\n",
            styles: [":host{font-size:1rem}:host ::ng-deep *{box-sizing:border-box}:host ::ng-deep button,:host ::ng-deep input,:host ::ng-deep optgroup,:host ::ng-deep select,:host ::ng-deep textarea{color:inherit;font:inherit;margin:0}:host ::ng-deep table{line-height:1.5em;border-collapse:collapse;border-spacing:0;display:table;width:100%;max-width:100%;overflow:auto;word-break:normal;word-break:keep-all}:host ::ng-deep table tr th{font-weight:700}:host ::ng-deep table tr section{font-size:.75em;font-weight:700}:host ::ng-deep table tr td,:host ::ng-deep table tr th{font-size:.875em;margin:0;padding:.5em 1em}:host ::ng-deep a{color:#1e6bb8;text-decoration:none}:host ::ng-deep a:hover{text-decoration:underline}"]
        })
    ], Ng2SmartTableComponent);
    return Ng2SmartTableComponent;
}());
export { Ng2SmartTableComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmcyLXNtYXJ0LXRhYmxlLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25nMi1zbWFydC10YWJsZS8iLCJzb3VyY2VzIjpbImxpYi9uZzItc21hcnQtdGFibGUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQWdCLFlBQVksRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUVoRyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUUzRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQU81RTtJQUxBO1FBUVcsYUFBUSxHQUFXLEVBQUUsQ0FBQztRQUVyQixjQUFTLEdBQUcsSUFBSSxZQUFZLEVBQU8sQ0FBQztRQUNwQyxrQkFBYSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDeEMsV0FBTSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDakMsU0FBSSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDL0IsV0FBTSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDakMsV0FBTSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDakMsa0JBQWEsR0FBRyxJQUFJLFlBQVksRUFBTyxDQUFDO1FBQ3hDLGdCQUFXLEdBQUcsSUFBSSxZQUFZLEVBQU8sQ0FBQztRQUN0QyxrQkFBYSxHQUFHLElBQUksWUFBWSxFQUFPLENBQUM7UUFDeEMsYUFBUSxHQUFzQixJQUFJLFlBQVksRUFBTyxDQUFDO1FBY2hFLG9CQUFlLEdBQVc7WUFDeEIsSUFBSSxFQUFFLFFBQVE7WUFDZCxVQUFVLEVBQUUsUUFBUTtZQUNwQixVQUFVLEVBQUUsS0FBSztZQUNqQixhQUFhLEVBQUUsS0FBSztZ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LENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztZQUNsQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDaEMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJO1lBQzVDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtTQUNwQixDQUFDLENBQUM7SUFDTCxDQUFDO0lBck1RO1FBQVIsS0FBSyxFQUFFOzswREFBYTtJQUNaO1FBQVIsS0FBSyxFQUFFOzBDQUFXLE1BQU07NERBQU07SUFFckI7UUFBVCxNQUFNLEVBQUU7OzZEQUFxQztJQUNwQztRQUFULE1BQU0sRUFBRTs7aUVBQXlDO0lBQ3hDO1FBQVQsTUFBTSxFQUFFOzswREFBa0M7SUFDakM7UUFBVCxNQUFNLEVBQUU7O3dEQUFnQztJQUMvQjtRQUFULE1BQU0sRUFBRTs7MERBQWtDO0lBQ2pDO1FBQVQsTUFBTSxFQUFFOzswREFBa0M7SUFDakM7UUFBVCxNQUFNLEVBQUU7O2lFQUF5QztJQUN4QztRQUFULE1BQU0sRUFBRTs7K0RBQXVDO0lBQ3RDO1FBQVQsTUFBTSxFQUFFOztpRUFBeUM7SUFDeEM7UUFBVCxNQUFNLEVBQUU7MENBQVcsWUFBWTs0REFBZ0M7SUFkckQsc0JBQXNCO1FBTGxDLFNBQVMsQ0FBQztZQUNULFFBQVEsRUFBRSxpQkFBaUI7WUFFM0IsNmxEQUErQzs7U0FDaEQsQ0FBQztPQUNXLHNCQUFzQixDQXlNbEM7SUFBRCw2QkFBQztDQUFBLEFBek1ELElBeU1DO1NBek1ZLHNCQUFzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE91dHB1dCwgU2ltcGxlQ2hhbmdlLCBFdmVudEVtaXR0ZXIsIE9uQ2hhbmdlcyB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBHcmlkIH0gZnJvbSAnLi9saWIvZ3JpZCc7XG5pbXBvcnQgeyBEYXRhU291cmNlIH0gZnJvbSAnLi9saWIvZGF0YS1zb3VyY2UvZGF0YS1zb3VyY2UnO1xuaW1wb3J0IHsgUm93IH0gZnJvbSAnLi9saWIvZGF0YS1zZXQvcm93JztcbmltcG9ydCB7IGRlZXBFeHRlbmQgfSBmcm9tICcuL2xpYi9oZWxwZXJzJztcbmltcG9ydCB7IExvY2FsRGF0YVNvdXJjZSB9IGZyb20gJy4vbGliL2RhdGEtc291cmNlL2xvY2FsL2xvY2FsLmRhdGEtc291cmNlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmcyLXNtYXJ0LXRhYmxlJyxcbiAgc3R5bGVVcmxzOiBbJy4vbmcyLXNtYXJ0LXRhYmxlLmNvbXBvbmVudC5zY3NzJ10sXG4gIHRlbXBsYXRlVXJsOiAnLi9uZzItc21hcnQtdGFibGUuY29tcG9uZW50Lmh0bWwnLFxufSlcbmV4cG9ydCBjbGFzcyBOZzJTbWFydFRhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzIHtcblxuICBASW5wdXQoKSBzb3VyY2U6IGFueTtcbiAgQElucHV0KCkgc2V0dGluZ3M6IE9iamVjdCA9IHt9O1xuXG4gIEBPdXRwdXQoKSByb3dTZWxlY3QgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgpIHVzZXJSb3dTZWxlY3QgPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgpIGRlbGV0ZSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCkgZWRpdCA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuICBAT3V0cHV0KCkgY3JlYXRlID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoKSBjdXN0b20gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgpIGRlbGV0ZUNvbmZpcm0gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcbiAgQE91dHB1dCgpIGVkaXRDb25maXJtID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoKSBjcmVhdGVDb25maXJtID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG4gIEBPdXRwdXQoKSByb3dIb3ZlcjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcblxuICB0YWJsZUNsYXNzOiBzdHJpbmc7XG4gIHRhYmxlSWQ6IHN0cmluZztcbiAgcGVyUGFnZVNlbGVjdDogYW55O1xuICBpc0hpZGVIZWFkZXI6IGJvb2xlYW47XG4gIGlzSGlkZVN1YkhlYWRlcjogYm9vbGVhbjtcbiAgaXNQYWdlckRpc3BsYXk6IGJvb2xlYW47XG4gIHJvd0NsYXNzRnVuY3Rpb246IEZ1bmN0aW9uO1xuICBwYWdpbmF0ZVNpemU6IG51bWJlcjtcbiAgaGFzSnVtcFRvUGFnZTogYm9vbGVhbjtcblxuXG4gIGdyaWQ6IEdyaWQ7XG4gIGRlZmF1bHRTZXR0aW5nczogT2JqZWN0ID0ge1xuICAgIG1vZGU6ICdpbmxpbmUnLCAvLyBpbmxpbmV8ZXh0ZXJuYWx8Y2xpY2stdG8tZWRpdFxuICAgIHNlbGVjdE1vZGU6ICdzaW5nbGUnLCAvLyBzaW5nbGV8bXVsdGlcbiAgICBoaWRlSGVhZGVyOiBmYWxzZSxcbiAgICBoaWRlU3ViSGVhZGVyOiBmYWxzZSxcbiAgICBhY3Rpb25zOiB7XG4gICAgICBjb2x1bW5UaXRsZTogJ0FjdGlvbnMnLFxuICAgICAgYWRkOiB0cnVlLFxuICAgICAgZWRpdDogdHJ1ZSxcbiAgICAgIGRlbGV0ZTogdHJ1ZSxcbiAgICAgIGN1c3RvbTogW10sXG4gICAgICBwb3NpdGlvbjogJ2xlZnQnLCAvLyBsZWZ0fHJpZ2h0XG4gICAgfSxcbiAgICBmaWx0ZXI6IHtcbiAgICAgIGlucHV0Q2xhc3M6ICcnLFxuICAgIH0sXG4gICAgZWRpdDoge1xuICAgICAgaW5wdXRDbGFzczogJycsXG4gICAgICBlZGl0QnV0dG9uQ29udGVudDogJ0VkaXQnLFxuICAgICAgc2F2ZUJ1dHRvbkNvbnRlbnQ6ICdVcGRhdGUnLFxuICAgICAgY2FuY2VsQnV0dG9uQ29udGVudDogJ0NhbmNlbCcsXG4gICAgICBjb25maXJtU2F2ZTogZmFsc2UsXG4gICAgfSxcbiAgICBhZGQ6IHtcbiAgICAgIGlucHV0Q2xhc3M6ICcnLFxuICAgICAgYWRkQnV0dG9uQ29udGVudDogJ0FkZCBOZXcnLFxuICAgICAgY3JlYXRlQnV0dG9uQ29udGVudDogJ0NyZWF0ZScsXG4gICAgICBjYW5jZWxCdXR0b25Db250ZW50OiAnQ2FuY2VsJyxcbiAgICAgIGNvbmZpcm1DcmVhdGU6IGZhbHNlLFxuICAgIH0sXG4gICAgZGVsZXRlOiB7XG4gICAgICBkZWxldGVCdXR0b25Db250ZW50OiAnRGVsZXRlJyxcbiAgICAgIGNvbmZpcm1EZWxldGU6IGZhbHNlLFxuICAgIH0sXG4gICAgYXR0cjoge1xuICAgICAgaWQ6ICcnLFxuICAgICAgY2xhc3M6ICcnLFxuICAgIH0sXG4gICAgbm9EYXRhTWVzc2FnZTogJ05vIGRhdGEgZm91bmQnLFxuICAgIGNvbHVtbnM6IHt9LFxuICAgIHBhZ2VyOiB7XG4gICAgICBkaXNwbGF5OiB0cnVlLFxuICAgICAgcGVyUGFnZTogMTAsXG4gICAgICBwYWdpbmF0ZVNpemU6IDQsXG4gICAgICBoYXNKdW1wVG9QYWdlOiB0cnVlXG4gICAgfSxcbiAgICByb3dDbGFzc0Z1bmN0aW9uOiAoKSA9PiBcIlwiXG4gIH07XG5cbiAgaXNBbGxTZWxlY3RlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIG5nT25DaGFuZ2VzKGNoYW5nZXM6IHsgW3Byb3BlcnR5TmFtZTogc3RyaW5nXTogU2ltcGxlQ2hhbmdlIH0pIHtcbiAgICBpZiAodGhpcy5ncmlkKSB7XG4gICAgICBpZiAoY2hhbmdlc1snc2V0dGluZ3MnXSkge1xuICAgICAgICB0aGlzLmdyaWQuc2V0U2V0dGluZ3ModGhpcy5wcmVwYXJlU2V0dGluZ3MoKSk7XG4gICAgICB9XG4gICAgICBpZiAoY2hhbmdlc1snc291cmNlJ10pIHtcbiAgICAgICAgdGhpcy5zb3VyY2UgPSB0aGlzLnByZXBhcmVTb3VyY2UoKTtcbiAgICAgICAgdGhpcy5ncmlkLnNldFNvdXJjZSh0aGlzLnNvdXJjZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaW5pdEdyaWQoKTtcbiAgICB9XG4gICAgdGhpcy50YWJsZUlkID0gdGhpcy5ncmlkLmdldFNldHRpbmcoJ2F0dHIuaWQnKTtcbiAgICB0aGlzLnRhYmxlQ2xhc3MgPSB0aGlzLmdyaWQuZ2V0U2V0dGluZygnYXR0ci5jbGFzcycpO1xuICAgIHRoaXMuaXNIaWRlSGVhZGVyID0gdGhpcy5ncmlkLmdldFNldHRpbmcoJ2hpZGVIZWFkZXInKTtcbiAgICB0aGlzLmlzSGlkZVN1YkhlYWRlciA9IHRoaXMuZ3JpZC5nZXRTZXR0aW5nKCdoaWRlU3ViSGVhZGVyJyk7XG4gICAgdGhpcy5pc1BhZ2VyRGlzcGxheSA9IHRoaXMuZ3JpZC5nZXRTZXR0aW5nKCdwYWdlci5kaXNwbGF5Jyk7XG4gICAgdGhpcy5pc1BhZ2VyRGlzcGxheSA9IHRoaXMuZ3JpZC5nZXRTZXR0aW5nKCdwYWdlci5kaXNwbGF5Jyk7XG4gICAgdGhpcy5wZXJQYWdlU2VsZWN0ID0gdGhpcy5ncmlkLmdldFNldHRpbmcoJ3BhZ2VyLnBlclBhZ2VTZWxlY3QnKTtcbiAgICB0aGlzLnJvd0NsYXNzRnVuY3Rpb24gPSB0aGlzLmdyaWQuZ2V0U2V0dGluZygncm93Q2xhc3NGdW5jdGlvbicpO1xuICAgIHRoaXMucGFnaW5hdGVTaXplID0gdGhpcy5ncmlkLmdldFNldHRpbmcoJ3BhZ2luYXRlU2l6ZScpO1xuICAgIHRoaXMuaGFzSnVtcFRvUGFnZSA9IHRoaXMuZ3JpZC5nZXRTZXR0aW5nKCdoYXNKdW1wVG9QYWdlJyk7XG4gIH1cblxuICBlZGl0Um93U2VsZWN0KHJvdzogUm93KSB7XG4gICAgaWYgKHRoaXMuZ3JpZC5nZXRTZXR0aW5nKCdzZWxlY3RNb2RlJykgPT09ICdtdWx0aScpIHtcbiAgICAgIHRoaXMub25NdWx0aXBsZVNlbGVjdFJvdyhyb3cpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm9uU2VsZWN0Um93KHJvdyk7XG4gICAgfVxuICB9XG5cbiAgb25Vc2VyU2VsZWN0Um93KHJvdzogUm93KSB7XG4gICAgaWYgKHRoaXMuZ3JpZC5nZXRTZXR0aW5nKCdzZWxlY3RNb2RlJykgIT09ICdtdWx0aScpIHtcbiAgICAgIHRoaXMuZ3JpZC5zZWxlY3RSb3cocm93KTtcbiAgICAgIHRoaXMuZW1pdFVzZXJTZWxlY3RSb3cocm93KTtcbiAgICAgIHRoaXMuZW1pdFNlbGVjdFJvdyhyb3cpO1xuICAgIH1cbiAgfVxuXG4gIG9uUm93SG92ZXIocm93OiBSb3cpIHtcbiAgICB0aGlzLnJvd0hvdmVyLmVtaXQocm93KTtcbiAgfVxuXG4gIG11bHRpcGxlU2VsZWN0Um93KHJvdzogUm93KSB7XG4gICAgdGhpcy5ncmlkLm11bHRpcGxlU2VsZWN0Um93KHJvdyk7XG4gICAgdGhpcy5lbWl0VXNlclNlbGVjdFJvdyhyb3cpO1xuICAgIHRoaXMuZW1pdFNlbGVjdFJvdyhyb3cpO1xuICB9XG5cbiAgb25TZWxlY3RBbGxSb3dzKCRldmVudDogYW55KSB7XG4gICAgdGhpcy5pc0FsbFNlbGVjdGVkID0gIXRoaXMuaXNBbGxTZWxlY3RlZDtcbiAgICB0aGlzLmdyaWQuc2VsZWN0QWxsUm93cyh0aGlzLmlzQWxsU2VsZWN0ZWQpO1xuXG4gICAgdGhpcy5lbWl0VXNlclNlbGVjdFJvdyhudWxsKTtcbiAgICB0aGlzLmVtaXRTZWxlY3RSb3cobnVsbCk7XG4gIH1cblxuICBvblNlbGVjdFJvdyhyb3c6IFJvdykge1xuICAgIHRoaXMuZ3JpZC5zZWxlY3RSb3cocm93KTtcbiAgICB0aGlzLmVtaXRTZWxlY3RSb3cocm93KTtcbiAgfVxuXG4gIG9uTXVsdGlwbGVTZWxlY3RSb3cocm93OiBSb3cpIHtcbiAgICB0aGlzLmVtaXRTZWxlY3RSb3cocm93KTtcbiAgfVxuXG4gIGluaXRHcmlkKCkge1xuICAgIHRoaXMuc291cmNlID0gdGhpcy5wcmVwYXJlU291cmNlKCk7XG4gICAgdGhpcy5ncmlkID0gbmV3IEdyaWQodGhpcy5zb3VyY2UsIHRoaXMucHJlcGFyZVNldHRpbmdzKCkpO1xuICAgIHRoaXMuZ3JpZC5vblNlbGVjdFJvdygpLnN1YnNjcmliZSgocm93KSA9PiB0aGlzLmVtaXRTZWxlY3RSb3cocm93KSk7XG4gIH1cblxuICBwcmVwYXJlU291cmNlKCk6IERhdGFTb3VyY2Uge1xuICAgIGlmICh0aGlzLnNvdXJjZSBpbnN0YW5jZW9mIERhdGFTb3VyY2UpIHtcbiAgICAgIHJldHVybiB0aGlzLnNvdXJjZTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc291cmNlIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgIHJldHVybiBuZXcgTG9jYWxEYXRhU291cmNlKHRoaXMuc291cmNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IExvY2FsRGF0YVNvdXJjZSgpO1xuICB9XG5cbiAgcHJlcGFyZVNldHRpbmdzKCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIGRlZXBFeHRlbmQoe30sIHRoaXMuZGVmYXVsdFNldHRpbmdzLCB0aGlzLnNldHRpbmdzKTtcbiAgfVxuXG4gIGNoYW5nZVBhZ2UoJGV2ZW50OiBhbnkpIHtcbiAgICB0aGlzLnJlc2V0QWxsU2VsZWN0b3IoKTtcbiAgfVxuXG4gIHNvcnQoJGV2ZW50OiBhbnkpIHtcbiAgICB0aGlzLnJlc2V0QWxsU2VsZWN0b3IoKTtcbiAgfVxuXG4gIGZpbHRlcigkZXZlbnQ6IGFueSkge1xuICAgIHRoaXMucmVzZXRBbGxTZWxlY3RvcigpO1xuICB9XG5cbiAgcHJpdmF0ZSByZXNldEFsbFNlbGVjdG9yKCkge1xuICAgIHRoaXMuaXNBbGxTZWxlY3RlZCA9IGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBlbWl0VXNlclNlbGVjdFJvdyhyb3c6IFJvdykge1xuICAgIGNvbnN0IHNlbGVjdGVkUm93cyA9IHRoaXMuZ3JpZC5nZXRTZWxlY3RlZFJvd3MoKTtcblxuICAgIHRoaXMudXNlclJvd1NlbGVjdC5lbWl0KHtcbiAgICAgIGRhdGE6IHJvdyA/IHJvdy5nZXREYXRhKCkgOiBudWxsLFxuICAgICAgaXNTZWxlY3RlZDogcm93ID8gcm93LmdldElzU2VsZWN0ZWQoKSA6IG51bGwsXG4gICAgICBzb3VyY2U6IHRoaXMuc291cmNlLFxuICAgICAgc2VsZWN0ZWQ6IHNlbGVjdGVkUm93cyAmJiBzZWxlY3RlZFJvd3MubGVuZ3RoID8gc2VsZWN0ZWRSb3dzLm1hcCgocjogUm93KSA9PiByLmdldERhdGEoKSkgOiBbXSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgZW1pdFNlbGVjdFJvdyhyb3c6IFJvdykge1xuICAgIHRoaXMucm93U2VsZWN0LmVtaXQoe1xuICAgICAgZGF0YTogcm93ID8gcm93LmdldERhdGEoKSA6IG51bGwsXG4gICAgICBpc1NlbGVjdGVkOiByb3cgPyByb3cuZ2V0SXNTZWxlY3RlZCgpIDogbnVsbCxcbiAgICAgIHNvdXJjZTogdGhpcy5zb3VyY2UsXG4gICAgfSk7XG4gIH1cblxufVxuIl19