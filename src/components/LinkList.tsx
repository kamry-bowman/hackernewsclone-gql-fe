import React, { Component } from 'react';
import { Query, SubscriptionResult } from 'react-apollo';
import gql from 'graphql-tag';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { RouteComponentProps } from 'react-router';
import Link from './Link';
import { LINKS_PER_PAGE } from '../constants';

export interface LinkI {
  id: string;
  description: string;
  url: string;
  createdAt: string;
  postedBy: { name: string; id: string };
  votes: Array<{ id: string; user: { id: string } }>;
}

type MatchRouteProps = RouteComponentProps<{ page: string }>;

interface VoteI {
  id: string;
  link: LinkI;
}

type LinkSubscription = SubscriptionResult<{
  newLink: VoteI;
}>;

export interface DataI {
  feed: {
    links: LinkI[];
    __typename?: string;
    count: number;
  };
}

type LinkOrderByInput =
  | 'description_ASC'
  | 'description_DESC'
  | 'url_ASC'
  | 'url_DESC'
  | 'createdAt_ASC'
  | 'createdAt_DESC';

interface Variables {
  filter: string;
  skip: number;
  first: number;
  orderBy: LinkOrderByInput;
}

export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      count
    }
  }
`;

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      votes {
        id
        user {
          id
        }
      }
    }
  }
`;

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      id
      link {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`;

class LinkList extends Component<MatchRouteProps, {}> {
  _updateCacheAfterVote = (
    store: InMemoryCache,
    createdVote: VoteI,
    linkId: string
  ) => {
    const data = store.readQuery<DataI, Variables>({ query: FEED_QUERY });

    let votedLink = data.feed.links.find(link => link.id === linkId);
    if (votedLink) {
      votedLink.votes = createdVote.link.votes;
    }
    store.writeQuery({ query: FEED_QUERY, data });
  };

  _subscribeToNewLinks = (subscribeToMore: Function) => {
    subscribeToMore({
      document: NEW_LINKS_SUBSCRIPTION,
      updateQuery: (
        prev: DataI,
        { subscriptionData }: { subscriptionData: LinkSubscription }
      ) => {
        if (!subscriptionData.data) {
          return prev;
        }
        const newLink = subscriptionData.data.newLink;

        const result = {
          ...prev,
          feed: {
            ...prev.feed,
            links: [newLink, ...prev.feed.links],
          },
        };

        return result;
      },
    });
  };

  _subscribeToNewVotes = (subscribeToMore: Function) => {
    subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION,
    });
  };

  _getLinksToRender = (data: DataI) => {
    const isNewPage = this.props.location.pathname.includes('new');
    if (isNewPage) {
      return data.feed.links;
    }
    const rankedLinks = data.feed.links.slice();
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
    return rankedLinks;
  };

  _getQueryVariables = () => {
    const isNewPage = this.props.location.pathname.includes('new');
    const page = parseInt(this.props.match.params.page, 10);

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;

    return { first, skip, orderBy };
  };

  _nextPage = (data: DataI) => {
    const page = parseInt(this.props.match.params.page, 10);
    if (page <= data.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1;
      this.props.history.push(`/new/${nextPage}`);
    }
  };

  _previousPage = () => {
    const page = parseInt(this.props.match.params.page, 10);
    if (page > 1) {
      const previousPage = page - 1;
      this.props.history.push(`/new/${previousPage}`);
    }
  };

  render() {
    return (
      <Query query={FEED_QUERY} variables={this._getQueryVariables()}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) {
            return <div>Fetching</div>;
          }
          if (error) {
            console.dir(error);
            return <div>Error</div>;
          }

          this._subscribeToNewLinks(subscribeToMore);
          this._subscribeToNewVotes(subscribeToMore);

          const linksToRender = this._getLinksToRender(data);
          const isNewPage = this.props.location.pathname.includes('new');
          const pageIndex = this.props.match.params.page
            ? (Number(this.props.match.params.page) - 1) * LINKS_PER_PAGE
            : 0;
          return (
            <React.Fragment>
              {linksToRender.map((link: LinkI, i: number) => (
                <Link
                  key={link.id}
                  link={link}
                  index={i}
                  updateStoreAfterVote={this._updateCacheAfterVote}
                />
              ))}
              {isNewPage && (
                <div className="flex ml4 mv3 gray">
                  <div
                    className="pointer mr2"
                    onClick={e => this._previousPage()}
                  >
                    Previous
                  </div>
                  <div className="pointer" onClick={e => this._nextPage(data)}>
                    Next
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        }}
      </Query>
    );
  }
}

export default LinkList;
