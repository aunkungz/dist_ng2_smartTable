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
          <span class="text-go-to-page" *ngIf="hasJumpToPage"> Go to page </span>
          <input type="number" *ngIf="hasJumpToPage" class="form-control jump-to-page" (keyup.enter)="jumpToPage()" [(ngModel)]="jumpPage" placeholder=""/>
          <button type="button" class="go-btn" *ngIf="hasJumpToPage" (click)="jumpToPage()">Go</button>
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
        styles: [".ng2-smart-pagination{display:inline-flex;font-size:.875em;padding:0}.ng2-smart-pagination .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.ng2-smart-pagination .ng2-smart-page-item{display:inline}.ng2-smart-pagination .page-link-next,.ng2-smart-pagination .page-link-prev{font-size:10px}:host{display:flex;justify-content:space-between}:host select{margin:1rem 0 1rem 1rem}:host label{margin:1rem 0 1rem 1rem;line-height:2.5rem}.jump-to-page{width:15%;text-align:center;margin-left:5px;margin-right:5px}input.jump-to-page::-webkit-inner-spin-button,input.jump-to-page::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.go-btn{margin-right:10px}.text-go-to-page{margin-top:3px}"]
    })
], PagerComponent);
export { PagerComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vbmcyLXNtYXJ0LXRhYmxlLyIsInNvdXJjZXMiOlsibGliL2NvbXBvbmVudHMvcGFnZXIvcGFnZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUE0QixNQUFNLGVBQWUsQ0FBQztBQUdqRyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sbUNBQW1DLENBQUM7QUFnRS9ELElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWM7SUE5RDNCO1FBaUVXLGtCQUFhLEdBQVUsRUFBRSxDQUFDO1FBR3pCLGVBQVUsR0FBRyxJQUFJLFlBQVksRUFBTyxDQUFDO1FBTXJDLFVBQUssR0FBVyxDQUFDLENBQUM7SUFvSDlCLENBQUM7SUE5R0MsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUNsQixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUU7Z0JBQy9CLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDbkM7WUFDRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsV0FBVyxFQUFFLEVBQUU7Z0JBQ3RFLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUM7Z0JBQy9DLDZEQUE2RDtnQkFDN0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO2dCQUNuQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMs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RUFBRTs7cURBQXdCO0FBQ3RCO0lBQVQsTUFBTSxFQUFFOztrREFBc0M7QUFOcEMsY0FBYztJQTlEMUIsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLHVCQUF1QjtRQUVqQyxRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlEVDs7S0FDRixDQUFDO0dBQ1csY0FBYyxDQWdJMUI7U0FoSVksY0FBYyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5wdXQsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBPbkNoYW5nZXMsIFNpbXBsZUNoYW5nZXMgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBEYXRhU291cmNlIH0gZnJvbSAnLi4vLi4vbGliL2RhdGEtc291cmNlL2RhdGEtc291cmNlJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbmcyLXNtYXJ0LXRhYmxlLXBhZ2VyJyxcbiAgc3R5bGVVcmxzOiBbJy4vcGFnZXIuY29tcG9uZW50LnNjc3MnXSxcbiAgdGVtcGxhdGU6IGBcbiAgICAgIFxuICAgICAgPG5hdiAqbmdJZj1cInNob3VsZFNob3coKVwiIGNsYXNzPVwibmcyLXNtYXJ0LXBhZ2luYXRpb24tbmF2XCI+XG4gICAgICAgIDx1bCBjbGFzcz1cIm5nMi1zbWFydC1wYWdpbmF0aW9uIHBhZ2luYXRpb25cIj5cbiAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQtZ28tdG8tcGFnZVwiICpuZ0lmPVwiaGFzSnVtcFRvUGFnZVwiPiBHbyB0byBwYWdlIDwvc3Bhbj5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiICpuZ0lmPVwiaGFzSnVtcFRvUGFnZVwiIGNsYXNzPVwiZm9ybS1jb250cm9sIGp1bXAtdG8tcGFnZVwiIChrZXl1cC5lbnRlcik9XCJqdW1wVG9QYWdlKClcIiBbKG5nTW9kZWwpXT1cImp1bXBQYWdlXCIgcGxhY2Vob2xkZXI9XCJcIi8+XG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJnby1idG5cIiAqbmdJZj1cImhhc0p1bXBUb1BhZ2VcIiAoY2xpY2spPVwianVtcFRvUGFnZSgpXCI+R288L2J1dHRvbj5cbiAgICAgICAgICA8bGkgY2xhc3M9XCJuZzItc21hcnQtcGFnZS1pdGVtIHBhZ2UtaXRlbVwiIFtuZ0NsYXNzXT1cIntkaXNhYmxlZDogZ2V0UGFnZSgpID09IDF9XCI+XG4gICAgICAgICAgICA8YSBjbGFzcz1cIm5nMi1zbWFydC1wYWdlLWxpbmsgcGFnZS1saW5rXCIgaHJlZj1cIiNcIlxuICAgICAgICAgICAgKGNsaWNrKT1cImdldFBhZ2UoKSA9PSAxID8gZmFsc2UgOiBwYWdpbmF0ZSgxKVwiIGFyaWEtbGFiZWw9XCJGaXJzdFwiPlxuICAgICAgICAgICAgICA8c3BhbiBhcmlhLWhpZGRlbj1cInRydWVcIj4mbGFxdW87PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInNyLW9ubHlcIj5GaXJzdDwvc3Bhbj5cbiAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICAgIDxsaSBjbGFzcz1cIm5nMi1zbWFydC1wYWdlLWl0ZW0gcGFnZS1pdGVtXCIgW25nQ2xhc3NdPVwie2Rpc2FibGVkOiBnZXRQYWdlKCkgPT0gMX1cIj5cbiAgICAgICAgICAgIDxhIGNsYXNzPVwibmcyLXNtYXJ0LXBhZ2UtbGluayBwYWdlLWxpbmsgcGFnZS1saW5rLXByZXZcIiBocmVmPVwiI1wiXG4gICAgICAgICAgICAgIChjbGljayk9XCJnZXRQYWdlKCkgPT0gMSA/IGZhbHNlIDogcHJldigpXCIgYXJpYS1sYWJlbD1cIlByZXZcIj5cbiAgICAgICAgICAgICAgPHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+Jmx0Ozwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+UHJldjwvc3Bhbj5cbiAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICAgIDxsaSBjbGFzcz1cIm5nMi1zbWFydC1wYWdlLWl0ZW0gcGFnZS1pdGVtXCJcbiAgICAgICAgICBbbmdDbGFzc109XCJ7YWN0aXZlOiBnZXRQYWdlKCkgPT0gcGFnZX1cIiAqbmdGb3I9XCJsZXQgcGFnZSBvZiBnZXRQYWdlcygpXCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm5nMi1zbWFydC1wYWdlLWxpbmsgcGFnZS1saW5rXCJcbiAgICAgICAgICAgICpuZ0lmPVwiZ2V0UGFnZSgpID09IHBhZ2VcIj57eyBwYWdlIH19IDxzcGFuIGNsYXNzPVwic3Itb25seVwiPihjdXJyZW50KTwvc3Bhbj48L3NwYW4+XG4gICAgICAgICAgICA8YSBjbGFzcz1cIm5nMi1zbWFydC1wYWdlLWxpbmsgcGFnZS1saW5rXCIgaHJlZj1cIiNcIlxuICAgICAgICAgICAgKGNsaWNrKT1cInBhZ2luYXRlKHBhZ2UpXCIgKm5nSWY9XCJnZXRQYWdlKCkgIT0gcGFnZVwiPnt7IHBhZ2UgfX08L2E+XG4gICAgICAgICAgPC9saT5cblxuICAgICAgICAgIDxsaSBjbGFzcz1cIm5nMi1zbWFydC1wYWdlLWl0ZW0gcGFnZS1pdGVtXCJcbiAgICAgICAgICAgICAgW25nQ2xhc3NdPVwie2Rpc2FibGVkOiBnZXRQYWdlKCkgPT0gZ2V0TGFzdCgpfVwiPlxuICAgICAgICAgICAgPGEgY2xhc3M9XCJuZzItc21hcnQtcGFnZS1saW5rIHBhZ2UtbGluayBwYWdlLWxpbmstbmV4dFwiIGhyZWY9XCIjXCJcbiAgICAgICAgICAgICAgKGNsaWNrKT1cImdldFBhZ2UoKSA9PSBnZXRMYXN0KCkgPyBmYWxzZSA6IG5leHQoKVwiIGFyaWEtbGFiZWw9XCJOZXh0XCI+XG4gICAgICAgICAgICAgIDxzcGFuIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPiZndDs8L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwic3Itb25seVwiPk5leHQ8L3NwYW4+XG4gICAgICAgICAgICA8L2E+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgICBcbiAgICAgICAgICA8bGkgY2xhc3M9XCJuZzItc21hcnQtcGFnZS1pdGVtIHBhZ2UtaXRlbVwiXG4gICAgICAgICAgW25nQ2xhc3NdPVwie2Rpc2FibGVkOiBnZXRQYWdlKCkgPT0gZ2V0TGFzdCgpfVwiPlxuICAgICAgICAgICAgPGEgY2xhc3M9XCJuZzItc21hcnQtcGFnZS1saW5rIHBhZ2UtbGlua1wiIGhyZWY9XCIjXCJcbiAgICAgICAgICAgIChjbGljayk9XCJnZXRQYWdlKCkgPT0gZ2V0TGFzdCgpID8gZmFsc2UgOiBwYWdpbmF0ZShnZXRMYXN0KCkpXCIgYXJpYS1sYWJlbD1cIkxhc3RcIj5cbiAgICAgICAgICAgICAgPHNwYW4gYXJpYS1oaWRkZW49XCJ0cnVlXCI+JnJhcXVvOzwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJzci1vbmx5XCI+TGFzdDwvc3Bhbj5cbiAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICA8L3VsPlxuICAgICAgPC9uYXY+XG4gICAgICBcbiAgICAgIDxuYXYgKm5nSWY9XCJwZXJQYWdlU2VsZWN0ICYmIHBlclBhZ2VTZWxlY3QubGVuZ3RoID4gMFwiIGNsYXNzPVwibmcyLXNtYXJ0LXBhZ2luYXRpb24tcGVyLXBhZ2VcIj5cbiAgICAgICAgPGxhYmVsIGZvcj1cInBlci1wYWdlXCI+XG4gICAgICAgICAgUGVyIFBhZ2U6XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDxzZWxlY3QgKGNoYW5nZSk9XCJvbkNoYW5nZVBlclBhZ2UoJGV2ZW50KVwiIFsobmdNb2RlbCldPVwiY3VycmVudFBlclBhZ2VcIiBpZD1cInBlci1wYWdlXCI+XG4gICAgICAgICAgPG9wdGlvbiAqbmdGb3I9XCJsZXQgaXRlbSBvZiBwZXJQYWdlU2VsZWN0XCIgW3ZhbHVlXT1cIml0ZW1cIj57eyBpdGVtIH19PC9vcHRpb24+XG4gICAgICAgIDwvc2VsZWN0PlxuICAgICAgPC9uYXY+XG4gIGAsXG59KVxuZXhwb3J0IGNsYXNzIFBhZ2VyQ29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzIHtcblxuICBASW5wdXQoKSBzb3VyY2U6IERhdGFTb3VyY2U7XG4gIEBJbnB1dCgpIHBlclBhZ2VTZWxlY3Q6IGFueVtdID0gW107XG4gIEBJbnB1dCgpIHBhZ2luYXRlU2l6ZTpudW1iZXI7XG4gIEBJbnB1dCgpIGhhc0p1bXBUb1BhZ2U6IGJvb2xlYW47XG4gIEBPdXRwdXQoKSBjaGFuZ2VQYWdlID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XG5cbiAgY3VycmVudFBlclBhZ2U6IGFueTtcblxuICBwcm90ZWN0ZWQgcGFnZXM6IEFycmF5PGFueT47XG4gIHByb3RlY3RlZCBwYWdlOiBudW1iZXI7XG4gIHByb3RlY3RlZCBjb3VudDogbnVtYmVyID0gMDtcbiAgcHJvdGVjdGVkIHBlclBhZ2U6IG51bWJlcjtcbiAganVtcFBhZ2U6IG51bWJlcjtcblxuICBwcm90ZWN0ZWQgZGF0YUNoYW5nZWRTdWI6IFN1YnNjcmlwdGlvbjtcblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKGNoYW5nZXMuc291cmNlKSB7XG4gICAgICBpZiAoIWNoYW5nZXMuc291cmNlLmZpcnN0Q2hhbmdlKSB7XG4gICAgICAgIHRoaXMuZGF0YUNoYW5nZWRTdWIudW5zdWJzY3JpYmUoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZGF0YUNoYW5nZWRTdWIgPSB0aGlzLnNvdXJjZS5vbkNoYW5nZWQoKS5zdWJzY3JpYmUoKGRhdGFDaGFuZ2VzKSA9PiB7XG4gICAgICAgIHRoaXMucGFnZSA9IHRoaXMuc291cmNlLmdldFBhZ2luZygpLnBhZ2U7XG4gICAgICAgIHRoaXMucGVyUGFnZSA9IHRoaXMuc291cmNlLmdldFBhZ2luZygpLnBlclBhZ2U7XG4gICAgICAgIC8vIHRoaXMucGFnaW5hdGVTaXplcyA9IHRoaXMuc291cmNlLmdldFBhZ2luZygpLnBhZ2luYXRlU2l6ZTtcbiAgICAgICAgdGhpcy5jdXJyZW50UGVyUGFnZSA9IHRoaXMucGVyUGFnZTtcbiAgICAgICAgdGhpcy5jb3VudCA9IHRoaXMuc291cmNlLmNvdW50KCk7XG4gICAgICAgIGlmICh0aGlzLmlzUGFnZU91dE9mQm91bmNlKCkpIHtcbiAgICAgICAgICB0aGlzLnNvdXJjZS5zZXRQYWdlKC0tdGhpcy5wYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucHJvY2Vzc1BhZ2VDaGFuZ2UoZGF0YUNoYW5nZXMpO1xuICAgICAgICB0aGlzLmluaXRQYWdlcygpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdlIGNoYW5nZSB0aGUgcGFnZSBoZXJlIGRlcGVuZGluZyBvbiB0aGUgYWN0aW9uIHBlcmZvcm1lZCBhZ2FpbnN0IGRhdGEgc291cmNlXG4gICAqIGlmIGEgbmV3IGVsZW1lbnQgd2FzIGFkZGVkIHRvIHRoZSBlbmQgb2YgdGhlIHRhYmxlIC0gdGhlbiBjaGFuZ2UgdGhlIHBhZ2UgdG8gdGhlIGxhc3RcbiAgICogaWYgYSBuZXcgZWxlbWVudCB3YXMgYWRkZWQgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgdGFibGUgLSB0aGVuIHRvIHRoZSBmaXJzdCBwYWdlXG4gICAqIEBwYXJhbSBjaGFuZ2VzXG4gICAqL1xuICBwcm9jZXNzUGFnZUNoYW5nZShjaGFuZ2VzOiBhbnkpIHtcbiAgICBpZiAoY2hhbmdlc1snYWN0aW9uJ10gPT09ICdwcmVwZW5kJykge1xuICAgICAgdGhpcy5zb3VyY2Uuc2V0UGFnZSgxKTtcbiAgICB9XG4gICAgaWYgKGNoYW5nZXNbJ2FjdGlvbiddID09PSAnYXBwZW5kJykge1xuICAgICAgdGhpcy5zb3VyY2Uuc2V0UGFnZSh0aGlzLmdldExhc3QoKSk7XG4gICAgfVxuICB9XG5cbiAgc2hvdWxkU2hvdygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2UuY291bnQoKSA+IHRoaXMucGVyUGFnZTtcbiAgfVxuXG4gIHBhZ2luYXRlKHBhZ2U6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIHRoaXMuc291cmNlLnNldFBhZ2UocGFnZSk7XG4gICAgdGhpcy5wYWdlID0gcGFnZTtcbiAgICB0aGlzLmNoYW5nZVBhZ2UuZW1pdCh7IHBhZ2UgfSk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgbmV4dCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wYWdpbmF0ZSh0aGlzLmdldFBhZ2UoKSArIDEpO1xuICB9XG5cbiAgcHJldigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wYWdpbmF0ZSh0aGlzLmdldFBhZ2UoKSAtIDEpO1xuICB9XG5cbiAgZ2V0UGFnZSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnBhZ2U7XG4gIH1cblxuICBnZXRQYWdlcygpOiBBcnJheTxhbnk+IHtcbiAgICByZXR1cm4gdGhpcy5wYWdlcztcbiAgfVxuXG4gIGdldExhc3QoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gTWF0aC5jZWlsKHRoaXMuY291bnQgLyB0aGlzLnBlclBhZ2UpO1xuICB9XG5cbiAgaXNQYWdlT3V0T2ZCb3VuY2UoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICh0aGlzLnBhZ2UgKiB0aGlzLnBlclBhZ2UpID49ICh0aGlzLmNvdW50ICsgdGhpcy5wZXJQYWdlKSAmJiB0aGlzLnBhZ2UgPiAxO1xuICB9XG5cbiAganVtcFRvUGFnZSgpe1xuICAgIHRoaXMucGFnaW5hdGUodGhpcy5qdW1wUGFnZSk7XG4gIH1cblxuICBpbml0UGFnZXMoKSB7XG4gICAgY29uc3QgcGFnZXNDb3VudCA9IHRoaXMuZ2V0TGFzdCgpO1xuICAgIGxldCBzaG93UGFnZXNDb3VudCA9IHRoaXMucGFnaW5hdGVTaXplW1wicGFnZXJcIl1bXCJwYWdpbmF0ZVNpemVcIl07XG4gICAgc2hvd1BhZ2VzQ291bnQgPSBwYWdlc0NvdW50IDwgc2hvd1BhZ2VzQ291bnQgPyBwYWdlc0NvdW50IDogc2hvd1BhZ2VzQ291bnQ7XG4gICAgdGhpcy5wYWdlcyA9IFtdO1xuXG4gICAgaWYgKHRoaXMuc2hvdWxkU2hvdygpKSB7XG5cbiAgICAgIGxldCBtaWRkbGVPbmUgPSBNYXRoLmNlaWwoc2hvd1BhZ2VzQ291bnQgLyAyKTtcbiAgICAgIG1pZGRsZU9uZSA9IHRoaXMucGFnZSA+PSBtaWRkbGVPbmUgPyB0aGlzLnBhZ2UgOiBtaWRkbGVPbmU7XG5cbiAgICAgIGxldCBsYXN0T25lID0gbWlkZGxlT25lICsgTWF0aC5mbG9vcihzaG93UGFnZXNDb3VudCAvIDIpO1xuICAgICAgbGFzdE9uZSA9IGxhc3RPbmUgPj0gcGFnZXNDb3VudCA/IHBhZ2VzQ291bnQgOiBsYXN0T25lO1xuXG4gICAgICBjb25zdCBmaXJzdE9uZSA9IGxhc3RPbmUgLSBzaG93UGFnZXNDb3VudCArIDE7XG5cbiAgICAgIGZvciAobGV0IGkgPSBmaXJzdE9uZTsgaSA8PSBsYXN0T25lOyBpKyspIHtcbiAgICAgICAgdGhpcy5wYWdlcy5wdXNoKGkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9uQ2hhbmdlUGVyUGFnZShldmVudDogYW55KSB7XG4gICAgaWYgKHRoaXMuY3VycmVudFBlclBhZ2UpIHtcblxuICAgICAgaWYgKHR5cGVvZiB0aGlzLmN1cnJlbnRQZXJQYWdlID09PSAnc3RyaW5nJyAmJiB0aGlzLmN1cnJlbnRQZXJQYWdlLnRvTG93ZXJDYXNlKCkgPT09ICdhbGwnKSB7XG4gICAgICAgIHRoaXMuc291cmNlLmdldFBhZ2luZygpLnBlclBhZ2UgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zb3VyY2UuZ2V0UGFnaW5nKCkucGVyUGFnZSA9IHRoaXMuY3VycmVudFBlclBhZ2UgKiAxO1xuICAgICAgICB0aGlzLnNvdXJjZS5yZWZyZXNoKCk7XG4gICAgICB9XG4gICAgICB0aGlzLmluaXRQYWdlcygpO1xuICAgIH1cbiAgfVxuXG59XG4iXX0=