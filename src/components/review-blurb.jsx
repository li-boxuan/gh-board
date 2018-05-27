import classnames from 'classnames';
import Database from '../database';
import Loadable from './loadable';

function ReviewBlurb(props) {
  const {card} = props;
  const {url} = card;

  const splitUrl = url.split('/');
  const reviewNumber = splitUrl[splitUrl.length - 1];

  const classes = {
    'review-blurb': true
  };

  return (
    <span className={classnames(classes)}>
      <a className='blurb-number-link'
        target='_blank'
        href={url}
        >
        <span className='blurb-number'>{reviewNumber}</span>
      </a>
    </span>
  );
}

function ReviewBlurbShell(props) {
  const {card, primaryRepoName, context} = props;
  const {repoOwner, repoName} = card;
  const promise = Database.getRepoOrNull(repoOwner, repoName);

  return (
    <Loadable
      promise={promise}
      renderLoaded={(repo) => (<ReviewBlurb repo={repo} card={card} primaryRepoName={primaryRepoName} context={context} />)}
    />
  );
}

export default ReviewBlurbShell;
