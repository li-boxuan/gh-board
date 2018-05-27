import {Component} from 'react';
import ReactDOM from 'react-dom';
import * as BS from 'react-bootstrap';
import _ from 'underscore';
import { DragSource } from 'react-dnd';
import classnames from 'classnames';
import {Link} from 'react-router';
import {CalendarIcon, ChecklistIcon, MilestoneIcon, CommentIcon, AlertIcon, PencilIcon, CheckIcon, PrimitiveDotIcon, XIcon} from 'react-octicons';
import {Diff2Html} from 'diff2html';

import {getFilters} from '../route-utils';
import IssueStore from '../issue-store';
import {PULL_REQUEST_ISSUE_RELATION} from '../gfm-dom';
import SettingsStore from '../settings-store';

import Loadable from './loadable';
import GithubFlavoredMarkdown from './gfm';
import Time from './time';
import {Timer} from './time'; // used for polling PR status
import LabelBadge from './label-badge';
import IssueOrPullRequestBlurb from './issue-blurb';
import Reactions from './reactions';

function DiffHtml(props) {
  const {path, diffHunk} = props;
  const inputDiff = '--- a/' + path + '\n+++ b/' + path + '\n' + diffHunk;
  const outputHtml = Diff2Html.getPrettyHtml(
    inputDiff, {inputFormat: 'diff'}
  );
  return (
    <div dangerouslySetInnerHTML={{__html: outputHtml}} />
  );
}

function ReviewCard(props) {
  const {card, primaryRepoName, columnRegExp, onDragStart} = props;
  const {repoOwner, repoName, number, id, bodyText, path, diffHunk, url, reactions} = card;

  const key = `${repoOwner}/${repoName}#${number}-${id}`;

  // comment updatedAt is updated when comment content is edited.
  // Note that the default `updatedAt` field of review comment
  // provided by GraphQL API is inaccurate. Thus, we use our custom
  // updatedAt, defined by `lastEditedAt` and `createdAt` time if never edited.
  const updatedAt = card.updatedAt;

  const user = card.author;
  const assignedAvatar = (
    <Link to={getFilters().toggleUserName(user.login).url()}>
      <img
        key='avatar'
        className='avatar-image'
        title={'Click to filter on ' + user.login}
        src={user.avatarUrl}/>
    </Link>
  );
  // stop highlighting after 5min
  const isUpdated = Date.now() - Date.parse(updatedAt) < 2 * 60 * 1000;

  // put the corresponding pull request as related card
  const issueCard = IssueStore.issueNumberToCard(repoOwner, repoName, number);
  const relatedCards = [issueCard].map((issueCard) => {
    let title;
    if (issueCard.issue) {
      title = (
        <span className='related-issue-title'>{issueCard.issue.title}</span>
      );
    }
    return (
      <div key={issueCard.key()} className='related-issue'>
        <IssueOrPullRequestBlurb
          card={issueCard}
          primaryRepoName={card.repoName}/>
        {title}
      </div>
    );
  });

  const classes = {
    'issue': true,
    'is-updated': isUpdated,
  };

  const header = [
    <IssueOrPullRequestBlurb key='issue-blurb'
      card={card}
      primaryRepoName={primaryRepoName} />,
  ];

  const bodyPopover = (
    <BS.Popover className='popover-issue-body' id={`popover-${key}-body`} title='diff hunk'>
      <DiffHtml path={path} diffHunk={diffHunk}/>
    </BS.Popover>
  );


  function TitleLink(props) {
    const {children} = props;
    return (
      <BS.OverlayTrigger
        delayShow={2000}
        container={this}
        trigger={['hover', 'focus']}
        placement='bottom'
        overlay={bodyPopover}>
        {children}
      </BS.OverlayTrigger>
    );
  }

  let reactionsStat = {
    THUMBS_UP: 0,
    THUMBS_DOWN: 0,
    LAUGH: 0,
    HOORAY: 0,
    HEART: 0,
    CONFUSED: 0
  };
  if (reactions) {
    reactions.forEach(reaction => reactionsStat[reaction.content]++);
  }

  return (
    <div className='-card-and-related'>
      <BS.ListGroupItem
        key={key}
        header={header}
        onDragStart={onDragStart}
        className={classnames(classes)}>

        <TitleLink>
          <span className='-extra-span-for-inline-popover'>
            <a
              key='link'
              className='issue-title'
              target='_blank'
              href={url}>
                <GithubFlavoredMarkdown
                  inline
                  repoOwner={repoOwner}
                  repoName={repoName}
                  text={bodyText}/>
            </a>
          </span>
        </TitleLink>

        <span key='footer' className='issue-footer'>
          <span key='left-footer' className='comment-reactions'>
            <Reactions stat={reactionsStat}/>
          </span>
          <span key='right-footer' className='issue-time-and-user'>
            <Time key='time' className='updated-at' dateTime={updatedAt}/>
            {assignedAvatar}
          </span>
        </span>
      </BS.ListGroupItem>
      <div key='related' className='related-issues'>
        {relatedCards}
      </div>
    </div>
  );
}

class Review extends Component {
  render() {
    const {review} = this.props;
    const node = (
      <ReviewCard card={review}/>
    );
    return node;
  }
}

export default Review;
