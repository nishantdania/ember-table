import { attribute } from '@ember-decorators/component';
import { computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { type, optional } from '@ember-decorators/argument/type';
import { htmlSafe } from '@ember/string';
import Component from '@ember/component';
import layout from '../templates/components/tree-table-grouping-cell';

export default class TreeTableGroupingCell extends Component {
  layout = layout;

  @argument
  @type(optional('any'))
  value;

  @argument
  @type(optional('object'))
  row;

  @attribute
  @computed('row.depth')
  get style() {
    let depth = this.get('row.depth');
    return htmlSafe(`padding-left: ${depth * 20}px;`);
  }
}
