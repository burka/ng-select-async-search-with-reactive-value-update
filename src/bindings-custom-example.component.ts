import { Component, OnInit } from '@angular/core';
import { Input, ViewEncapsulation} from '@angular/core';
import {Observable, of, Subject} from "rxjs";
import {catchError, debounceTime, distinctUntilChanged, map, switchMap, tap} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";

@Component({
    selector: 'bindings-custom-example',
    templateUrl: './bindings-custom-example.component.html',
    styleUrls: ['./bindings-custom-example.component.scss']
})
export class BindingsCustomExampleComponent {
  repos$: Observable<any[]>;
  reposLoading = false;
  reposInput$ = new Subject<string>();
  repo: string;

  constructor(
    protected readonly $http: HttpClient,
  ) {
    this.initializeLoading();
  }

  private initializeLoading() {
    this.repos$ = this.reposInput$.pipe(
      distinctUntilChanged(),
      debounceTime(200),
      tap(() => this.reposLoading = true),
      switchMap(term => this.loadrepos(term).pipe(
        catchError(() => of([])), // empty list on error
        tap(() => this.reposLoading = false)
      )),
      map((repos: any[]) => {
          if (repos && repos.length > 0)
            return repos.map(repo => {
              return {...repo, label: repo.name};
            });
          return [];
        }
      )
    );
  }

  private loadrepos(repo: string) {
    const path = `https://api.github.com/search/repositories?q=${repo}&sort=stars&order=desc`;
    return this.$http.get<any>(path).pipe(map(data => data.items), tap(console.log));

  }

  selectionChanged(selectedBeruf: any) {
    // simulate ngrx-forms 
    setTimeout(() => this.repo = selectedBeruf.name, 500);
  }
}
