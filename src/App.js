import React from 'react';
import './App.css';
import { Button, Paper, Typography as T } from 'material-ui';
import { withState, compose, lifecycle, withProps, branch, renderNothing } from 'recompose';
import { HotKeys } from 'react-hotkeys';
import update from 'immutability-helper';
import Papa from 'papaparse';

const download = (filename, text) => {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

const App = ({ save, yes, no, list, idx, prevLink, nextLink }) => (
  <HotKeys
    keyMap={{
      prevLink: ['a', 'left'],
      nextLink: ['d', 'right'],
      no: 'w',
      yes: 'e',
      save: 's',
    }}
    handlers={{
      prevLink,
      nextLink,
      yes,
      no,
      save,
    }}
  >
    <div className="app">
      <div className="buttonTray">
        <div className="buttonRow">
          <Paper
            className={[
              'indexDisplay',
              list[idx].human_judgement === 'no_proposal' ? 'red' : '',
              list[idx].human_judgement === 'found_proposal' ? 'green' : '',
            ].join(' ')}
          >
            <T classes={{ root: 'indexDisplayText' }}>
              <strong>
                Document {idx + 1} / {list.length}
              </strong>{' '}
              : {list[idx]['Company Name']} {list[idx]['Date Filed']}{' '}
              <a href={`/o1-htm_files/${list[idx].Filename}.htm`}>{`/o1-htm_files/${list[idx].Filename}.htm`}</a>
              {list[idx].human_judgement && ` (${list[idx].human_judgement})`}
            </T>
          </Paper>
        </div>
        <div className="buttonRow right">
          <Button classes={{ root: 'button' }} variant="raised" size="small" color="primary" onClick={prevLink}>
            Previous (A or &larr;)
          </Button>
          <Button classes={{ root: 'button' }} variant="raised" size="small" color="primary" onClick={nextLink}>
            Next (D or &rarr;)
          </Button>
          <Button classes={{ root: 'button red' }} variant="raised" size="small" onClick={no}>
            No proposal (W)
          </Button>
          <Button classes={{ root: 'button green' }} variant="raised" size="small" onClick={yes}>
            Found proposal (E)
          </Button>
          <Button classes={{ root: 'button' }} variant="raised" size="small" onClick={save}>
            Save (S)
          </Button>
        </div>
      </div>
      <iframe
        src={`/o1-htm_files/${list[idx].Filename}.htm`}
        title="htm"
        className="viewer"
        width="100%"
        height="300"
      />
    </div>
  </HotKeys>
);

const enhance = compose(
  withState('list', 'setList', []),
  withState('idx', 'setIdx', 0),
  withProps(({ list, setList, idx, setIdx }) => ({
    prevLink: () => {
      if (idx > 0) {
        setIdx(idx - 1);
      }
    },
    nextLink: () => {
      if (idx < list.length - 1) {
        setIdx(idx + 1);
      }
    },
    yes: () => {
      setList(update(list, { [idx]: { human_judgement: { $set: 'found_proposal' } } }));
    },
    no: () => {
      setList(update(list, { [idx]: { human_judgement: { $set: 'no_proposal' } } }));
    },
    save: () => {
      download('list.csv', Papa.unparse(list));
    },
  })),
  lifecycle({
    componentWillMount() {
      setImmediate(async () => {
        const res = await fetch('/list.csv');
        const listCsv = await res.text();
        const list = Papa.parse(listCsv, { header: true });
        this.props.setList(list.data.filter(x => x.num_pages_with_shareholder_proposal > 5));
      });
    },
  }),
  branch(({ list }) => list.length === 0, renderNothing),
);

export default enhance(App);
