import moment from 'moment';
import GraphQL from 'graphql-client';
import Client from 'github-client';

const {
  GITHUB_ISSUE_INFO_QUERY,
  GITHUB_PR_INFO_QUERY,
  GITHUB_LABEL_INFO_QUERY,
  GITHUB_REACTION_INFO_QUERY
} = require('./script/queries');

// a wrapper for GraphQL client
class GraphQLClient {
  constructor(token) {
    this.GH_GQL_BASE = 'https://api.github.com/graphql';
    this.GH_GQL_OPTIONS = {
      url: GH_GQL_BASE,
      headers: token
        ? { Authorization: `bearer ${token}` }
        : {}
    };
    this.client = GraphQL(GH_GQL_OPTIONS);
    this.earliestDate = process.env.EARLIEST_DATE || '2016-03-10T00:00:00Z';
    this.pageThreshold = process.env.PAGE_THRESHOLD || -1;
    this.eventId = 0;
  }
  repos(repoOwner, repoName) {
    this.repoOwner = repoOwner;
    this.repoName = repoName;
    return this;
  }
  issues() {
    this._fetch = this._fetchIssues;
    return this;
  }
  reactions(config) {
    ({ pr_number, per_review } = config);
    this._fetch = this._fetchReactions;
    this.prNumber = pr_number;
    // number of comments per review to fetch
    this.perReview = per_review;
    return this;
  }
  async fetchAll(config) {
    ({ per_page } = config);
    this.perPage = per_page;
    this.pagination = true;
    this.cursor = null;
    while (this.hasNextPage) {
      await this._fetch(this.cursor);
    }
  }
  async fetchOne(config) {
    ({ per_page } = config);
    this.perPage = per_page;
    this.pagination = false;
    await this._fetch(null);
  }
  _updateRateLimit(config) {
    // config = {method, path, data, options}
    const emitterRate = {
      remaining: this.remaining,
      limit: this.limit,
      reset: this.resetAt
    };
    // to match Restful API style
    const responseStatus = 200;
    Client.emit('end', this.eventId, config, responseStatus, emitterRate);
    this.eventId++;
  }
  async _fetchReactions(cursor) {
    const owner = this.repoOwner;
    const name = this.repoName;
    const number = this.prNumber;
    const reviewCnt = this.perPage;
    const commentCnt = this.perPage;
    const maxCommentsPerReview = this.perReview;
    const { data, errors } = await client.query(
      GITHUB_REACTION_INFO_QUERY,
      {owner, name, number, reviewCnt, maxCommentsPerReview, commentCnt}
    );
    let rawComments = null;
    if (data) {
      // collect review comments
      rawComments = data.repository.pullRequest.reviews.nodes.map(
        node => node.comments.nodes);
      rawComments = [].concat.apply([], rawComments);
      // collect issue comments
      rawComments = rawComments.concat(
        data.repository.pullRequest.comments.nodes);
    } else {
      console.log('warning: no available reaction data!',
        'owner:', owner, 'name:', name, 'pull request number:', number,
        'reviewCnt:', reviewCnt, 'maxCommentsPerReview', maxCommentsPerReview,
        'commentCnt', commentCnt, 'error:', errors);
    }
    // reactions are wrapped by corresponding comment
    return rawComments;
  }
  async _fetchIssues(cursor) {
  }
  async _fetchPullRequests(cursor) {

  }
}


export default GraphQLClient;
;(async () => {
  let client = new GraphQLClient(token);
  x = await client.repos(repoOwner, repoName).reactions({pr_number, per_review: 20}).fetchOne({per_page: 100});

  // current usages:
  fetchAllIssues = Client.getOcto().repos(repoOwner, repoName).issues().fetchAll({state: issuesState, per_page: 100, sort: 'updated'});
  fetchAllIssues = Client.getOcto().repos(repoOwner, repoName).issues().fetchOne({state: issuesState, per_page: 100, sort: 'updated'});
  Client.getOcto().orgs(repoOwner).repos().fetchAll();
  Client.getOcto().repos(repoOwner, repoName).issues(issue.number).update({labels: labelNames});

  // proposed usages:
  fetchAllIssues = Client.getGraphQLClient().repos(repoOwner, repoName).issues().fetchAll({per_page: 100});
  fetchAllReactions = Client.getGraphQLClient().repos(repoOwner, repoName).reactions({pr_number, per_review: 20}).fetchOne({per_page: 100});
});