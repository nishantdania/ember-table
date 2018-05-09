/* global Hammer */
import EmberTableBaseCell from './ember-table-base-cell';
import { isNone } from '@ember/utils';
import { computed, get } from '@ember/object';
import layout from '../templates/components/ember-table-header';

const PRESS_OFFSET_THRESHOLD = 10;
const COLUMN_STATIC = 0;
const COLUMN_RESIZE = 1;
const COLUMN_REORDERING = 2;

export default EmberTableBaseCell.extend({
  layout,
  tagName: 'th',
  classNameBindings: ['isFixed::et-th'],
  attributeBindings: ['style:style', 'rowSpan:rowspan', 'columnSpan:colspan'],

  fixedColumnWidth: 0,

  /**
   * X position where user first touches on the header.
   */
  _firstTouchX: -1,

  /**
   * X position where user last touches this component.
   */
  _touchX: -1,

  /**
   * A variable used for column resizing & ordering. When user press mouse at a point that's close
   * to column boundary (using some threshold), this variable set whether it's the left or right
   * column.
   */
  _columnState: COLUMN_STATIC,

  /**
   * Indicates if this column can be reordered or not. It's false by default.
   */
  enableColumnResize: computed('column.isResizable', {
    get() {
      return this.get('column.isResizable');
    }
  }),

  enableColumnReorder: computed('column.isReorderable', 'isFixed', {
    get() {
      return this.get('column.isReorderable') && !this.get('isFixed');
    }
  }),

  columnSpan: computed('column.subcolumns.length', {
    get() {
      let subcolumnsLength = get(this, 'column.subcolumns.length');
      if (isNone(subcolumnsLength) || subcolumnsLength <= 1) {
        return 1;
      }

      return subcolumnsLength;
    }
  }),

  rowSpan: computed('tableHasSubcolumns', 'column.subcolumns.length', {
    get() {
      if (this.get('tableHasSubcolumns') !== true) {
        return 1;
      }

      let subcolumnsLength = get(this, 'column.subcolumns.length');
      if (isNone(subcolumnsLength) || subcolumnsLength === 0) {
        return 2;
      }

      return 1;
    }
  }),

  /**
   * An object that listens to touch/ press/ drag events.
   */
  _hammer: null,

  didInsertElement() {
    this._super(...arguments);

    let hammer = new Hammer(this.element);

    hammer.add(new Hammer.Press({ time: 0 }));

    hammer.on('press', (ev) => {
      let box = this.element.getBoundingClientRect();
      if (this.get('enableColumnResize')) {
        if (box.right - ev.pointers[0].clientX < PRESS_OFFSET_THRESHOLD) {
          this._columnState = COLUMN_RESIZE;
        }
      }

      this._firstTouchX = ev.pointers[0].clientX;
      this._touchX = ev.pointers[0].clientX;
    });

    hammer.on('tap', () => {
      this._columnState = COLUMN_STATIC;
    });

    hammer.on('panmove', (ev) => {
      let columnIndex = this.get('columnIndex');
      let enableColumnResize = this.get('enableColumnResize');
      let enableColumnReorder = this.get('enableColumnReorder');
      let fixedColumnWidth = this.get('fixedColumnWidth');

      let { _columnState, _firstTouchX, _touchX } = this;

      let [{ clientX }] = ev.pointers;
      if (enableColumnResize && _columnState === COLUMN_RESIZE) {
        this.sendAction('onColumnResized', columnIndex, clientX - _touchX);
        this._touchX = clientX;
        return;
      }

      // Column reordering
      if (enableColumnReorder) {
        // First fixed column cannot be moved.
        if (fixedColumnWidth > 0 && columnIndex === 0) {
          return;
        }

        let box = this.element.getBoundingClientRect();
        this.sendAction('onColumnReorder', columnIndex, box, clientX - _firstTouchX);

        this._columnState = COLUMN_REORDERING;
      }
    });

    hammer.on('panend', (ev) => {
      let columnIndex = this.get('columnIndex');

      let { _columnState, _firstTouchX, _touchX } = this;

      let [{ clientX }] = ev.pointers;

      switch (_columnState) {
        case COLUMN_REORDERING:
          this.sendAction('onColumnReorderEnded', columnIndex, clientX - _firstTouchX);
          break;

        case COLUMN_RESIZE:
          this.sendAction('onColumnResizeEnded', columnIndex, clientX - _touchX);
          break;
      }

      this._columnState = COLUMN_STATIC;
    });

    this._hammer = hammer;
  },

  willDestroyElement() {
    let hammer = this._hammer;

    hammer.off('press');
    hammer.off('panmove');
    hammer.off('panend');

    this._super(...arguments);
  },

  actions: {
    onHeaderEvent() {
      this.sendAction('onHeaderEvent', ...arguments);
    }
  }
});
