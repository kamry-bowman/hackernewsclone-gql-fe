import React, { Component } from 'react';
import { Query, SubscriptionResult } from 'react-apollo';
import gql from 'graphql-tag';
import Link from './Link';
import { InMemoryCache } from 'apollo-cache-inmemory';

export interface LinkI {
  id: string;
  description: string;
  url: string;
  createdAt: string;
  postedBy: { name: string; id: string };
  votes: Array<{ id: string; user: { id: string } }>;
}

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
  {
    feed {
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

class LinkList extends Component {
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

  render() {
    return (
      <Query query={FEED_QUERY}>
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

          const linksToRender = data ? data.feed.links : [];
          return (
            <div>
              {linksToRender.map((link: LinkI, i: number) => (
                <Link
                  key={link.id}
                  link={link}
                  index={i}
                  updateStoreAfterVote={this._updateCacheAfterVote}
                />
              ))}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default LinkList;
