/* eslint-disable react/prop-types,react/jsx-filename-extension */
import React from 'react';
import { Button, Paper, TextField, Typography as T } from 'material-ui';
import { withState, compose, lifecycle, withProps, branch, renderNothing, withHandlers } from 'recompose';
import { HotKeys } from 'react-hotkeys';
import update from 'immutability-helper';
import Papa from 'papaparse';

import './App.css';

const download = (filename, text) => {
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

const App = ({
  save,
  yes,
  no,
  removeProposal,
  proposals,
  editProposal,
  list,
  idx,
  prevLink,
  nextLink,
  addProposal,
}) => (
  <HotKeys
    keyMap={{
      prevLink: ['a', 'left'],
      nextLink: ['d', 'right'],
      no: 'w',
      yes: 'e',
      addProposal: 'p',
      removeProposal: 'o',
      save: 's',
    }}
    handlers={{
      prevLink,
      nextLink,
      yes,
      no,
      addProposal,
      removeProposal,
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
          <Button classes={{ root: 'button red' }} variant="raised" size="small" onClick={removeProposal}>
            Remove proposal (O)
          </Button>
          <Button classes={{ root: 'button green' }} variant="raised" size="small" onClick={addProposal}>
            Add proposal (P)
          </Button>
          <Button classes={{ root: 'button' }} variant="raised" size="small" onClick={save}>
            Save (S)
          </Button>
        </div>
      </div>
<<<<<<< HEAD
=======
      <div>
        {list[idx].shareholder_proposal &&
          list[idx].shareholder_proposal.map((p, i) => (
            <TextField
              key={i}
              label={`Proposal ${i + 1}`}
              value={proposals[i]}
              onChange={(e) => {
                editProposal({ proposalIdx: i, proposalText: e.target.value });
              }}
            />
          ))}
      </div>
>>>>>>> 8bfdfb9910d11e3764e9f939688f59a34abb70b4
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
  withHandlers({
    prevLink: ({ idx, setIdx }) => () => {
      if (idx > 0) {
        setIdx(idx - 1);
      }
    },
    nextLink: ({ list, idx, setIdx }) => () => {
      if (idx < list.length - 1) {
        setIdx(idx + 1);
      }
    },
    yes: ({ setList, list, idx }) => () => {
      setList(update(list, { [idx]: { human_judgement: { $set: 'found_proposal' } } }));
    },
    no: ({ setList, list, idx }) => () => {
      setList(update(list, { [idx]: { human_judgement: { $set: 'no_proposal' } } }));
    },
    editProposal: ({ setList, list, idx }) => ({ proposalIdx, proposalText }) => {
      setList(
        update(list, {
          [idx]: { shareholder_proposal: { [proposalIdx]: { $set: proposalText } } },
        }),
      );
    },
    addProposal: ({ setList, list, idx }) => () => {
      setList(
        update(list, {
          [idx]: { shareholder_proposal: (p) => update(p || [], { $push: [''] }) },
        }),
      );
    },
    removeProposal: ({ setList, list, idx }) => () => {
      setList(
        update(list, {
          [idx]: { shareholder_proposal: (p) => (p && p.length > 0 ? p.slice(0, p.length - 1) : p) },
        }),
      );
    },
    save: ({ list }) => {
      download(
        'list.csv',
        Papa.unparse(list.map((r) => ({ ...r, shareholder_proposal: r.shareholder_proposal.join(' |||| ') }))),
      );
    },
  }),
  withProps(({ list, idx }) => ({
    proposals: list[idx] && list[idx].shareholder_proposal,
  })),
  lifecycle({
    componentWillMount() {
      setImmediate(async () => {
        const res = await fetch('/list.csv');
        const listCsv = await res.text();
        const list = Papa.parse(listCsv, { header: true });
        this.props.setList(
          list.data.filter((x) => x.num_pages_with_shareholder_proposal > 5).map((r) => ({
            ...r,
            shareholder_proposal: r.shareholder_proposal ? r.shareholder_proposal.split(' |||| ') : [],
          })),
        );
      });
    },
  }),
  branch(({ list }) => list.length === 0, renderNothing),
);

export default enhance(App);
