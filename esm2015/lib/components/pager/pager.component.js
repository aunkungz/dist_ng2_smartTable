import * as tslib_1 from "tslib";
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DataSource } from '../../lib/data-source/data-source';
let PagerComponent = class PagerComponent {
    constructor() {
        this.perPageSelect = [];
        this.changePage = new EventEmitter();
        this.count = 0;
    }
    ngOnChanges(changes) {
        if (changes.source) {
            if (!changes.source.firstChange) {
                this.dataChangedSub.unsubscribe();
            }
            this.dataChangedSub = this.source.onChanged().subscribe((dataChanges) => {
                this.page = this.source.getPaging().page;
                this.perPage = this.source.getPaging().perPage;
                // this.paginateSizes = this.source.getPaging().paginateSize;
                this.currentPerPage = this.perPage;
                this.count = this.source.count();
                if (this.isPageOutOfBounce()) {
                    this.source.setPage(--this.page);
                }
                this.processPageChange(dataChanges);
                this.initPages();
            });
        }
    }
    /**
     * We change the page here depending on the action performed against data source
     * if a new element was added to the end of the table - then change the page to the last
     * if a new element was added to the beginning of the table - then to the first page
     * @param changes
     */
    processPageChange(changes) {
        if (changes['action'] === 'prepend') {
            this.source.setPage(1);
        }
        if (changes['action'] === 'append') {
            this.source.setPage(this.getLast());
        }
    }
    shouldShow() {
        return this.source.count() > this.perPage;
    }
    paginate(page) {
        this.source.setPage(page);
        this.page = page;
        this.changePage.emit({ page });
        return false;
    }
    next() {
        return this.paginate(this.getPage() + 1);
    }
    prev() {
        return this.paginate(this.getPage() - 1);
    }
    getPage() {
        return this.page;
    }
    getPages() {
        return this.pages;
    }
    getLast() {
        return Math.ceil(this.count / this.perPage);
    }
    isPageOutOfBounce() {
        return (this.page * this.perPage) >= (this.count + this.perPage) && this.page > 1;
    }
    jumpToPage() {
        this.paginate(this.jumpPage);
    }
    initPages() {
        const pagesCount = this.getLast();
        let showPagesCount = this.paginateSize["pager"]["paginateSize"];
        showPagesCount = pagesCount < showPagesCount ? pagesCount : showPagesCount;
        this.pages = [];
        if (this.shouldShow()) {
            let middleOne = Math.ceil(showPagesCount / 2);
            middleOne = this.page >= middleOne ? this.page : middleOne;
            let lastOne = middleOne + Math.floor(showPagesCount / 2);
            lastOne = lastOne >= pagesCount ? pagesCount : lastOne;
            const firstOne = lastOne - showPagesCount + 1;
            for (let i = firstOne; i <= lastOne; i++) {
                this.pages.push(i);
            }
        }
    }
    onChangePerPage(event) {
        if (this.currentPerPage) {
            if (typeof this.currentPerPage === 'string' && this.currentPerPage.toLowerCase() === 'all') {
                this.source.getPaging().perPage = null;
            }
            else {
                this.source.getPaging().perPage = this.currentPerPage * 1;
                this.source.refresh();
            }
            this.initPages();
        }
    }
};
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", DataSource)
], PagerComponent.prototype, "source", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Array)
], PagerComponent.prototype, "perPageSelect", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Number)
], PagerComponent.prototype, "paginateSize", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], PagerComponent.prototype, "hasJumpToPage", void 0);
tslib_1.__decorate([
    Output(),
    tslib_1.__metadata("design:type", Object)
], PagerComponent.prototype, "changePage", void 0);
PagerComponent = tslib_1.__decorate([
    Component({
        selector: 'ng2-smart-table-pager',
        template: `
    <nav *ngIf="shouldShow()" class="ng2-smart-pagination-nav">
      <ul class="ng2-smart-pagination pagination">
        <input type="number" *ngIf="hasJumpToPage" class="form-control jump-to-page" (keyup.enter)="jumpToPage()" [(ngModel)]="jumpPage" placeholder=""/>
        
        <li class="ng2-smart-page-item page-item" [ngClass]="{disabled: getPage() == 1}">
          <a class="ng2-smart-page-link page-link" href="#"
          (click)="getPage() == 1 ? false : paginate(1)" aria-label="First">
            <span aria-hidden="true">&laquo;</span>
            <span class="sr-only">First</span>
          </a>
        </li>
        <li class="ng2-smart-page-item page-item" [ngClass]="{disabled: getPage() == 1}">
          <a class="ng2-smart-page-link page-link page-link-prev" href="#"
             (click)="getPage() == 1 ? false : prev()" aria-label="Prev">
            <span aria-hidden="true">&lt;</span>
            <span class="sr-only">Prev</span>
          </a>
        </li>
        <li class="ng2-smart-page-item page-item"
        [ngClass]="{active: getPage() == page}" *ngFor="let page of getPages()">
          <span class="ng2-smart-page-link page-link"
          *ngIf="getPage() == page">{{ page }} <span class="sr-only">(current)</span></span>
          <a class="ng2-smart-page-link page-link" href="#"
          (click)="paginate(page)" *ngIf="getPage() != page">{{ page }}</a>
        </li>

        <li class="ng2-smart-page-item page-item"
            [ngClass]="{disabled: getPage() == getLast()}">
          <a class="ng2-smart-page-link page-link page-link-next" href="#"
             (click)="getPage() == getLast() ? false : next()" aria-label="Next">
            <span aria-hidden="true">&gt;</span>
            <span class="sr-only">Next</span>
          </a>
        </li>
        
        <li class="ng2-smart-page-item page-item"
        [ngClass]="{disabled: getPage() == getLast()}">
          <a class="ng2-smart-page-link page-link" href="#"
          (click)="getPage() == getLast() ? false : paginate(getLast())" aria-label="Last">
            <span aria-hidden="true">&raquo;</span>
            <span class="sr-only">Last</span>
          </a>
        </li>
      </ul>
    </nav>
    
    <nav *ngIf="perPageSelect && perPageSelect.length > 0" class="ng2-smart-pagination-per-page">
      <label for="per-page">
        Per Page:
      </label>
      <select (change)="onChangePerPage($event)" [(ngModel)]="currentPerPage" id="per-page">
        <option *ngFor="let item of perPageSelect" [value]="item">{{ item }}</option>
      </select>
    </nav>
  `,
        styles: [".ng2-smart-pagination{display:inline-flex;font-size:.875em;padding:0}.ng2-smart-pagination .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.ng2-smart-pagination .ng2-smart-page-item{display:inline}.ng2-smart-pagination .page-link-next,.ng2-smart-pagination .page-link-prev{font-size:10px}:host{display:flex;justify-content:space-between}:host select{margin:1rem 0 1rem 1rem}:host label{margin:1rem 0 1rem 1rem;line-height:2.5rem}.jump-to-page{width:24%;text-align:center}"]
    })
], PagerComponent);
export { PagerComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmcyLXNtYXJ0LXRhYmxlLyIsInNvdXJjZXMiOlsibGliL2NvbXBvbmVudHMvcGFnZXIvcGFnZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUE0QixNQUFNLGVBQWUsQ0FBQztBQUdqRyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUE4RC9ELElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWM7SUE1RDNCO1FBK0RXLGtCQUFhLEdBQVUsRUFBRSxDQUFDO1FBR3pCLGVBQVUsR0FBRyxJQUFJLFlBQVksRUFBTyxDQUFDO1FBTXJDLFVBQUssR0FBVyxDQUFDLENBQUM7SUFvSDlCLENBQUM7SUE5R0MsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDbkM7WUFDRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQ3RFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUM7Z0JBQy9DLDZEQUE2RDtnQkFDN0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO2dCQUNuQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMs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RUFBRTs7cURBQXdCO0FBQ3RCO0lBQVQsTUFBTSxFQUFFOztrREFBc0M7QUFOcEMsY0FBYztJQTVEMUIsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLHVCQUF1QjtRQUVqQyxRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1RFQ7O0tBQ0YsQ0FBQztHQUNXLGNBQWMsQ0FnSTFCO1NBaElZLGNBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgT25DaGFuZ2VzLCBTaW1wbGVDaGFuZ2VzIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgRGF0YVNvdXJjZSB9IGZyb20gJy4uLy4uL2xpYi9kYXRhLXNvdXJjZS9kYXRhLXNvdXJjZSc7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ25nMi1zbWFydC10YWJsZS1wYWdlcicsXG4gIHN0eWxlVXJsczogWycuL3BhZ2VyLmNvbXBvbmVudC5zY3NzJ10sXG4gIHRlbXBsYXRlOiBgXG4gICAgPG5hdiAqbmdJZj1cInNob3VsZFNob3coKVwiIGNsYXNzPVwibmcyLXNtYXJ0LXBhZ2luYXRpb24tbmF2XCI+XG4gICAgICA8dWwgY2xhc3M9XCJuZzItc21hcnQtcGFnaW5hdGlvbiBwYWdpbmF0aW9uXCI+XG4gICAgICAgIDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgKm5nSWY9XCJoYXNKdW1wVG9QYWdlXCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wganVtcC10by1wYWdlXCIgKGtleXVwLmVudGVyKT1cImp1bXBUb1BhZ2UoKVwiIFsobmdNb2RlbCldPVwianVtcFBhZ2VcIiBwbGFjZWhvbGRlcj1cIlwiLz5cbiAgICAgICAgXG4gICAgICAgIDxsaSBjbGFzcz1cIm5nMi1zbWFydC1wYWdlLWl0ZW0gcGFnZS1pdGVtXCIgW25nQ2xhc3NdPVwie2Rpc2FibGVkOiBnZXRQYWdlKCkgPT0gMX1cIj5cbiAgICAgICAgICA8YSBjbGFzcz1cIm5nMi1zbWFydC1wYWdlLWxpbmsgcGFnZS1saW5rXCIgaHJlZj1cIiNcIlxuICAgICAgICAgIChjbGljayk9XCJnZXRQYWdlKCkgPT0gMSA/IGZhbHNlIDogcGFnaW5hdGUoMSlcIiBhcmlhLWxhYmVsPVwiRmlyc3RcIj5cbiAgICAgICAgICAgIDxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZsYXF1bzs8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5GaXJzdDwvc3Bhbj5cbiAgICAgICAgICA8L2E+XG4gICAgICAgIDwvbGk+XG4gICAgICAgIDxsaSBjbGFzcz1cIm5nMi1zbWFydC1wYWdlLWl0ZW0gcGFnZS1pdGVtXCIgW25nQ2xhc3NdPVwie2Rpc2FibGVkOiBnZXRQYWdlKCkgPT0gMX1cIj5cbiAgICAgICAgICA8YSBjbGFzcz1cIm5nMi1zbWFydC1wYWdlLWxpbmsgcGFnZS1saW5rIHBhZ2UtbGluay1wcmV2XCIgaHJlZj1cIiNcIlxuICAgICAgICAgICAgIChjbGljayk9XCJnZXRQYWdlKCkgPT0gMSA/IGZhbHNlIDogcHJldigpXCIgYXJpYS1sYWJlbD1cIlByZXZcIj5cbiAgICAgICAgICAgIDxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZsdDs8L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5QcmV2PC9zcGFuPlxuICAgICAgICAgIDwvYT5cbiAgICAgICAgPC9saT5cbiAgICAgICAgPGxpIGNsYXNzPVwibmcyLXNtYXJ0LXBhZ2UtaXRlbSBwYWdlLWl0ZW1cIlxuICAgICAgICBbbmdDbGFzc109XCJ7YWN0aXZlOiBnZXRQYWdlKCkgPT0gcGFnZX1cIiAqbmdGb3I9XCJsZXQgcGFnZSBvZiBnZXRQYWdlcygpXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJuZzItc21hcnQtcGFnZS1saW5rIHBhZ2UtbGlua1wiXG4gICAgICAgICAgKm5nSWY9XCJnZXRQYWdlKCkgPT0gcGFnZVwiPnt7IHBhZ2UgfX0gPHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+KGN1cnJlbnQpPC9zcGFuPjwvc3Bhbj5cbiAgICAgICAgICA8YSBjbGFzcz1cIm5nMi1zbWFydC1wYWdlLWxpbmsgcGFnZS1saW5rXCIgaHJlZj1cIiNcIlxuICAgICAgICAgIChjbGljayk9XCJwYWdpbmF0ZShwYWdlKVwiICpuZ0lmPVwiZ2V0UGFnZSgpICE9IHBhZ2VcIj57eyBwYWdlIH19PC9hPlxuICAgICAgICA8L2xpPlxuXG4gICAgICAgIDxsaSBjbGFzcz1cIm5nMi1zbWFydC1wYWdlLWl0ZW0gcGFnZS1pdGVtXCJcbiAgICAgICAgICAgIFtuZ0NsYXNzXT1cIntkaXNhYmxlZDogZ2V0UGFnZSgpID09IGdldExhc3QoKX1cIj5cbiAgICAgICAgICA8YSBjbGFzcz1cIm5nMi1zbWFydC1wYWdlLWxpbmsgcGFnZS1saW5rIHBhZ2UtbGluay1uZXh0XCIgaHJlZj1cIiNcIlxuICAgICAgICAgICAgIChjbGljayk9XCJnZXRQYWdlKCkgPT0gZ2V0TGFzdCgpID8gZmFsc2UgOiBuZXh0KClcIiBhcmlhLWxhYmVsPVwiTmV4dFwiPlxuICAgICAgICAgICAgPHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+Jmd0Ozwvc3Bhbj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwic3Itb25seVwiPk5leHQ8L3NwYW4+XG4gICAgICAgICAgPC9hPlxuICAgICAgICA8L2xpPlxuICAgICAgICBcbiAgICAgICAgPGxpIGNsYXNzPVwibmcyLXNtYXJ0LXBhZ2UtaXRlbSBwYWdlLWl0ZW1cIlxuICAgICAgICBbbmdDbGFzc109XCJ7ZGlzYWJsZWQ6IGdldFBhZ2UoKSA9PSBnZXRMYXN0KCl9XCI+XG4gICAgICAgICAgPGEgY2xhc3M9XCJuZzItc21hcnQtcGFnZS1saW5rIHBhZ2UtbGlua1wiIGhyZWY9XCIjXCJcbiAgICAgICAgICAoY2xpY2spPVwiZ2V0UGFnZSgpID09IGdldExhc3QoKSA/IGZhbHNlIDogcGFnaW5hdGUoZ2V0TGFzdCgpKVwiIGFyaWEtbGFiZWw9XCJMYXN0XCI+XG4gICAgICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mcmFxdW87PC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TGFzdDwvc3Bhbj5cbiAgICAgICAgICA8L2E+XG4gICAgICAgIDwvbGk+XG4gICAgICA8L3VsPlxuICAgIDwvbmF2PlxuICAgIFxuICAgIDxuYXYgKm5nSWY9XCJwZXJQYWdlU2VsZWN0ICYmIHBlclBhZ2VTZWxlY3QubGVuZ3RoID4gMFwiIGNsYXNzPVwibmcyLXNtYXJ0LXBhZ2luYXRpb24tcGVyLXBhZ2VcIj5cbiAgICAgIDxsYWJlbCBmb3I9XCJwZXItcGFnZVwiPlxuICAgICAgICBQZXIgUGFnZTpcbiAgICAgIDwvbGFiZWw+XG4gICAgICA8c2VsZWN0IChjaGFuZ2UpPVwib25DaGFuZ2VQZXJQYWdlKCRldmVudClcIiBbKG5nTW9kZWwpXT1cImN1cnJlbnRQZXJQYWdlXCIgaWQ9XCJwZXItcGFnZVwiPlxuICAgICAgICA8b3B0aW9uICpuZ0Zvcj1cImxldCBpdGVtIG9mIHBlclBhZ2VTZWxlY3RcIiBbdmFsdWVdPVwiaXRlbVwiPnt7IGl0ZW0gfX08L29wdGlvbj5cbiAgICAgIDwvc2VsZWN0PlxuICAgIDwvbmF2PlxuICBgLFxufSlcbmV4cG9ydCBjbGFzcyBQYWdlckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG5cbiAgQElucHV0KCkgc291cmNlOiBEYXRhU291cmNlO1xuICBASW5wdXQoKSBwZXJQYWdlU2VsZWN0OiBhbnlbXSA9IFtdO1xuICBASW5wdXQoKSBwYWdpbmF0ZVNpemU6bnVtYmVyO1xuICBASW5wdXQoKSBoYXNKdW1wVG9QYWdlOiBib29sZWFuO1xuICBAT3V0cHV0KCkgY2hhbmdlUGFnZSA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xuXG4gIGN1cnJlbnRQZXJQYWdlOiBhbnk7XG5cbiAgcHJvdGVjdGVkIHBhZ2VzOiBBcnJheTxhbnk+O1xuICBwcm90ZWN0ZWQgcGFnZTogbnVtYmVyO1xuICBwcm90ZWN0ZWQgY291bnQ6IG51bWJlciA9IDA7XG4gIHByb3RlY3RlZCBwZXJQYWdlOiBudW1iZXI7XG4gIGp1bXBQYWdlOiBudW1iZXI7XG5cbiAgcHJvdGVjdGVkIGRhdGFDaGFuZ2VkU3ViOiBTdWJzY3JpcHRpb247XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChjaGFuZ2VzLnNvdXJjZSkge1xuICAgICAgaWYgKCFjaGFuZ2VzLnNvdXJjZS5maXJzdENoYW5nZSkge1xuICAgICAgICB0aGlzLmRhdGFDaGFuZ2VkU3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmRhdGFDaGFuZ2VkU3ViID0gdGhpcy5zb3VyY2Uub25DaGFuZ2VkKCkuc3Vic2NyaWJlKChkYXRhQ2hhbmdlcykgPT4ge1xuICAgICAgICB0aGlzLnBhZ2UgPSB0aGlzLnNvdXJjZS5nZXRQYWdpbmcoKS5wYWdlO1xuICAgICAgICB0aGlzLnBlclBhZ2UgPSB0aGlzLnNvdXJjZS5nZXRQYWdpbmcoKS5wZXJQYWdlO1xuICAgICAgICAvLyB0aGlzLnBhZ2luYXRlU2l6ZXMgPSB0aGlzLnNvdXJjZS5nZXRQYWdpbmcoKS5wYWdpbmF0ZVNpemU7XG4gICAgICAgIHRoaXMuY3VycmVudFBlclBhZ2UgPSB0aGlzLnBlclBhZ2U7XG4gICAgICAgIHRoaXMuY291bnQgPSB0aGlzLnNvdXJjZS5jb3VudCgpO1xuICAgICAgICBpZiAodGhpcy5pc1BhZ2VPdXRPZkJvdW5jZSgpKSB7XG4gICAgICAgICAgdGhpcy5zb3VyY2Uuc2V0UGFnZSgtLXRoaXMucGFnZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnByb2Nlc3NQYWdlQ2hhbmdlKGRhdGFDaGFuZ2VzKTtcbiAgICAgICAgdGhpcy5pbml0UGFnZXMoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBXZSBjaGFuZ2UgdGhlIHBhZ2UgaGVyZSBkZXBlbmRpbmcgb24gdGhlIGFjdGlvbiBwZXJmb3JtZWQgYWdhaW5zdCBkYXRhIHNvdXJjZVxuICAgKiBpZiBhIG5ldyBlbGVtZW50IHdhcyBhZGRlZCB0byB0aGUgZW5kIG9mIHRoZSB0YWJsZSAtIHRoZW4gY2hhbmdlIHRoZSBwYWdlIHRvIHRoZSBsYXN0XG4gICAqIGlmIGEgbmV3IGVsZW1lbnQgd2FzIGFkZGVkIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHRhYmxlIC0gdGhlbiB0byB0aGUgZmlyc3QgcGFnZVxuICAgKiBAcGFyYW0gY2hhbmdlc1xuICAgKi9cbiAgcHJvY2Vzc1BhZ2VDaGFuZ2UoY2hhbmdlczogYW55KSB7XG4gICAgaWYgKGNoYW5nZXNbJ2FjdGlvbiddID09PSAncHJlcGVuZCcpIHtcbiAgICAgIHRoaXMuc291cmNlLnNldFBhZ2UoMSk7XG4gICAgfVxuICAgIGlmIChjaGFuZ2VzWydhY3Rpb24nXSA9PT0gJ2FwcGVuZCcpIHtcbiAgICAgIHRoaXMuc291cmNlLnNldFBhZ2UodGhpcy5nZXRMYXN0KCkpO1xuICAgIH1cbiAgfVxuXG4gIHNob3VsZFNob3coKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuc291cmNlLmNvdW50KCkgPiB0aGlzLnBlclBhZ2U7XG4gIH1cblxuICBwYWdpbmF0ZShwYWdlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICB0aGlzLnNvdXJjZS5zZXRQYWdlKHBhZ2UpO1xuICAgIHRoaXMucGFnZSA9IHBhZ2U7XG4gICAgdGhpcy5jaGFuZ2VQYWdlLmVtaXQoeyBwYWdlIH0pO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIG5leHQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucGFnaW5hdGUodGhpcy5nZXRQYWdlKCkgKyAxKTtcbiAgfVxuXG4gIHByZXYoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucGFnaW5hdGUodGhpcy5nZXRQYWdlKCkgLSAxKTtcbiAgfVxuXG4gIGdldFBhZ2UoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5wYWdlO1xuICB9XG5cbiAgZ2V0UGFnZXMoKTogQXJyYXk8YW55PiB7XG4gICAgcmV0dXJuIHRoaXMucGFnZXM7XG4gIH1cblxuICBnZXRMYXN0KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLmNvdW50IC8gdGhpcy5wZXJQYWdlKTtcbiAgfVxuXG4gIGlzUGFnZU91dE9mQm91bmNlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAodGhpcy5wYWdlICogdGhpcy5wZXJQYWdlKSA+PSAodGhpcy5jb3VudCArIHRoaXMucGVyUGFnZSkgJiYgdGhpcy5wYWdlID4gMTtcbiAgfVxuXG4gIGp1bXBUb1BhZ2UoKXtcbiAgICB0aGlzLnBhZ2luYXRlKHRoaXMuanVtcFBhZ2UpO1xuICB9XG5cbiAgaW5pdFBhZ2VzKCkge1xuICAgIGNvbnN0IHBhZ2VzQ291bnQgPSB0aGlzLmdldExhc3QoKTtcbiAgICBsZXQgc2hvd1BhZ2VzQ291bnQgPSB0aGlzLnBhZ2luYXRlU2l6ZVtcInBhZ2VyXCJdW1wicGFnaW5hdGVTaXplXCJdO1xuICAgIHNob3dQYWdlc0NvdW50ID0gcGFnZXNDb3VudCA8IHNob3dQYWdlc0NvdW50ID8gcGFnZXNDb3VudCA6IHNob3dQYWdlc0NvdW50O1xuICAgIHRoaXMucGFnZXMgPSBbXTtcblxuICAgIGlmICh0aGlzLnNob3VsZFNob3coKSkge1xuXG4gICAgICBsZXQgbWlkZGxlT25lID0gTWF0aC5jZWlsKHNob3dQYWdlc0NvdW50IC8gMik7XG4gICAgICBtaWRkbGVPbmUgPSB0aGlzLnBhZ2UgPj0gbWlkZGxlT25lID8gdGhpcy5wYWdlIDogbWlkZGxlT25lO1xuXG4gICAgICBsZXQgbGFzdE9uZSA9IG1pZGRsZU9uZSArIE1hdGguZmxvb3Ioc2hvd1BhZ2VzQ291bnQgLyAyKTtcbiAgICAgIGxhc3RPbmUgPSBsYXN0T25lID49IHBhZ2VzQ291bnQgPyBwYWdlc0NvdW50IDogbGFzdE9uZTtcblxuICAgICAgY29uc3QgZmlyc3RPbmUgPSBsYXN0T25lIC0gc2hvd1BhZ2VzQ291bnQgKyAxO1xuXG4gICAgICBmb3IgKGxldCBpID0gZmlyc3RPbmU7IGkgPD0gbGFzdE9uZTsgaSsrKSB7XG4gICAgICAgIHRoaXMucGFnZXMucHVzaChpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvbkNoYW5nZVBlclBhZ2UoZXZlbnQ6IGFueSkge1xuICAgIGlmICh0aGlzLmN1cnJlbnRQZXJQYWdlKSB7XG5cbiAgICAgIGlmICh0eXBlb2YgdGhpcy5jdXJyZW50UGVyUGFnZSA9PT0gJ3N0cmluZycgJiYgdGhpcy5jdXJyZW50UGVyUGFnZS50b0xvd2VyQ2FzZSgpID09PSAnYWxsJykge1xuICAgICAgICB0aGlzLnNvdXJjZS5nZXRQYWdpbmcoKS5wZXJQYWdlID0gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc291cmNlLmdldFBhZ2luZygpLnBlclBhZ2UgPSB0aGlzLmN1cnJlbnRQZXJQYWdlICogMTtcbiAgICAgICAgdGhpcy5zb3VyY2UucmVmcmVzaCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5pbml0UGFnZXMoKTtcbiAgICB9XG4gIH1cblxufVxuIl19