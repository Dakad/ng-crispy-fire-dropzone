import { Injectable, Output } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { scan, take, tap } from 'rxjs/operators';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';

export interface QueryConfig {
  path: string; //  path to collection
  field: string; // field to orderBy
  limit?: number; // limit per query
  reverse: boolean; // reverse order?
  prepend: boolean; // prepend to source?
}

@Injectable({
  providedIn: 'root'
})
export class PaginationService {
  // Source data
  private _data = new BehaviorSubject([]);
  private _loading = new BehaviorSubject(false);
  private _done = new BehaviorSubject(false);

  private query: QueryConfig;

  public data: Observable<any>;

  get loading(): Observable<boolean> {
    return this._loading.asObservable();
  }

  get done(): Observable<boolean> {
    return this._done.asObservable();
  }

  constructor(
    private db: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  // Initial query sets options and defines the Observable
  // passing opts will override the defaults
  init(path: string, field: string, opts?: any): void {
    this.query = {
      path,
      field,
      limit: 2,
      reverse: false,
      prepend: false,
      ...opts
    };

    const first = this.db.collection(this.query.path, ref => {
      return ref
        .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
        .limit(this.query.limit);
    });

    this.mapAndUpdate(first);

    // Create the observable array for consumption in components
    this.data = this._data.asObservable().pipe(
      scan((acc, val) => {
        return this.query.prepend ? val.concat(acc) : acc.concat(val);
      })
    );
  }

  // Retrieves additional data from firestore
  more(): void {
    const cursor = this.getCursor();

    const more = this.db.collection(this.query.path, ref => {
      return ref
        .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
        .limit(this.query.limit)
        .startAfter(cursor);
    });
    this.mapAndUpdate(more);
  }

  // Determines the doc snapshot to paginate query
  private getCursor() {
    const current = this._data.value;
    if (current.length) {
      return this.query.prepend
        ? current[0].doc
        : current[current.length - 1].doc;
    }
    return null;
  }

  // Maps the snapshot to usable format the updates source
  private mapAndUpdate(col: AngularFirestoreCollection<any>) {
    if (this._done.value || this._loading.value) {
      return;
    }

    // loading
    this._loading.next(true);

    // Map snapshot with doc ref (needed for cursor)
    return col
      .snapshotChanges()
      .pipe(
        tap(arr => {
          let values = arr.map(snap => {
            const data = snap.payload.doc.data();
            const doc = snap.payload.doc;
            return { ...data, doc };
          });

          // If prepending, reverse the batch order
          values = this.query.prepend ? values.reverse() : values;

          // update source with new values, done loading
          this._data.next(values);
          this._loading.next(false);

          // no more values, mark done
          if (!values.length) {
            this._done.next(true);
          }
        }),
        take(1)
      )
      .subscribe();
  }
}
