import * as BS from 'react-bootstrap';

function Reactions(props) {
  const {stat} = props;
  // use null when count is zero because we don't want to display
  // number zero on frontend
  const reactions = [
    {
      emoji: '👍',
      count: stat.THUMBS_UP || null,
      name: 'THUMBS_UP'
    },
    {
      emoji: '👎',
      count: stat.THUMBS_DOWN || null,
      name: 'THUMBS_DOWN'
    },
    {
      emoji: '😄',
      count: stat.LAUGH || null,
      name: 'LAUGH'
    },
    {
      emoji: '🎉',
      count: stat.HOORAY || null,
      name: 'HOORAY'
    },
    {
      emoji: '😕',
      count: stat.HEART || null,
      name: 'HEART'
    },
    {
      emoji: '❤️',
      count: stat.CONFUSED || null,
      name: 'STAR'
    }
  ];
  return reactions.map(reaction => {
    return (
      <BS.Button key={reaction.name} bsSize="xsmall">
        {reaction.emoji} {reaction.count}
      </BS.Button>
    );
  });
}

export default Reactions;