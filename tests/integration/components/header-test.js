import { module, test } from 'ember-qunit';

import generateTable from '../../helpers/generate-table';
import { componentModule } from '../../helpers/module';
import { toBase26 } from '../../helpers/base-26';

import TablePage from 'ember-table/test-support/pages/ember-table';

const table = TablePage.create();

module('Integration | header', function() {
  componentModule('resizing', function() {
    test('basic', async function(assert) {
      await generateTable(this);

      let originalWidth = table.headers.eq(1).width;
      await table.headers.eq(1).resize(30);
      assert.equal(table.headers.eq(1).width - originalWidth, 30, 'Column size is updated');
    });

    test('fixed column', async function(assert) {
      await generateTable(this, { hasFixedColumn: true });

      let originalWidth = table.headers.eq(0).width;
      await table.headers.eq(0).resize(30);
      assert.equal(table.headers.eq(0).width - originalWidth, 30, 'Fixed column size is updated');
    });

    test('fluid mode', async function(assert) {
      await generateTable(this, { resizeMode: 'fluid' });

      let originalWidth = table.headers.eq(1).width;
      await table.headers.eq(1).resize(30);

      assert.equal(table.headers.eq(1).width - originalWidth, 30, 'Column size is updated');
      assert.equal(
        table.headers.eq(2).width - originalWidth,
        -30,
        'Next column shrinks in fluid mode'
      );
    });

    test('equal column mode', async function(assert) {
      await generateTable(this, { fillMode: 'equal_column' });

      let expectedWidth = table.width / table.headers.length;

      table.headers.forEach(header => {
        assert.ok(
          Math.abs(header.width - expectedWidth) <= 1,
          'Table header have same width in equal resize mode.'
        );
      });
    });

    test('none mode', async function(assert) {
      let columnWidth = 30;

      await generateTable(this, {
        fillMode: 'none',
        columnOptions: {
          width: columnWidth,
        },
      });

      table.headers.forEach(header => {
        assert.ok(
          Math.abs(header.width - columnWidth) <= 1,
          'Table header keeps original width in none resize mode.'
        );
      });
    });

    test('first column mode', async function(assert) {
      let columnWidth = 30;

      await generateTable(this, {
        fillMode: 'first_column',
        columnCount: 2,
        columnOptions: {
          width: columnWidth,
        },
      });

      let tableWidth = table.width;
      let firstColumnWidth = table.headers.eq(0).width;

      assert.ok(
        Math.abs(tableWidth - firstColumnWidth - columnWidth) <= 1,
        'First column takes extra space in first column resize mode.'
      );

      assert.ok(
        Math.abs(table.headers.eq(1).width - columnWidth) <= 0,
        'Other columns keep same width in first column resize mode.'
      );
    });

    test('last column mode', async function(assert) {
      let columnWidth = 30;

      await generateTable(this, {
        fillMode: 'last_column',
        columnCount: 2,
        columnOptions: {
          width: columnWidth,
        },
      });

      let tableWidth = table.width;
      let lastColumnWidth = table.headers.eq(1).width;

      assert.ok(
        Math.abs(tableWidth - lastColumnWidth - columnWidth) <= 1,
        'First column takes extra space in first column resize mode.'
      );

      assert.ok(
        Math.abs(table.headers.eq(0).width - columnWidth) <= 0,
        'Other columns keep same width in first column resize mode.'
      );
    });

    test('column resize action is sent up to controller', async function(assert) {
      let expectedColumnIndex = 1;
      this.on('onResize', function(columnIndex) {
        assert.equal(
          columnIndex,
          expectedColumnIndex,
          'action is sent to controller after resizing'
        );
      });

      await generateTable(this);
      await table.headers.eq(1).resize(30);
    });
  });

  componentModule('reordering', function() {
    test('standard columns', async function(assert) {
      await generateTable(this);

      // With table without fixed column, you can swap first column.
      await table.headers.eq(1).moveByIndex(-1);
      assert.equal(table.headers.eq(0).text.trim(), 'B', 'First column is swapped');
      assert.equal(table.headers.eq(1).text.trim(), 'A', 'Second column is swapped');
    });

    test('fixed column', async function(assert) {
      await generateTable(this, { hasFixedColumn: true });

      // Case 1: Try to swap normal column with fixed column.
      // The table should prevent this action.
      await table.headers.eq(1).moveByIndex(-1);

      assert.equal(table.headers.eq(0).text.trim(), 'A', 'First column does not change');
      assert.equal(table.headers.eq(1).text.trim(), 'B', 'Second column does not change');

      // Case 2: Try to swap two normal columns
      await table.headers.eq(1).moveByIndex(1);
      assert.equal(table.headers.eq(1).text.trim(), 'C', 'Second column is swapped');
      assert.equal(table.headers.eq(2).text.trim(), 'B', 'Third column is swapped');
    });

    test('column reorder action is sent up to controller', async function(assert) {
      let expectedOldIndex = 1;
      let expectedNewIndex = 2;
      this.on('onReorder', function(oldIndex, newIndex) {
        assert.equal(oldIndex, expectedOldIndex, 'old column index is correct');
        assert.equal(newIndex, expectedNewIndex, 'new column index is correct');
      });

      await generateTable(this);
      await table.headers.eq(1).moveByIndex(1);
    });
  });

  componentModule('subcolumns', function() {
    test('they work', async function(assert) {
      await generateTable(this, {
        columnOptions: {
          subcolumnCount: 2,
        },
      });

      assert.equal(table.header.rows.length, 2, 'There are 2 rows in the header.');

      table.headers.forEach((header, index) => {
        assert.equal(header.text, toBase26(index), 'Group name is correct');
      });

      table.subheaders.forEach((header, index) => {
        assert.equal(header.text, toBase26(index % 2), 'Subcolumn name is correct');
      });
    });

    test('they do not render by default', async function(assert) {
      await generateTable(this);

      assert.equal(table.header.rows.length, 1, 'There is only one row in the header.');
    });
  });
});
