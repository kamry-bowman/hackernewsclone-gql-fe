import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Link from './Link';
import { InMemoryCache } from 'apollo-cache-inmemory';

interface LinkI {
  id: string;
  description: string;
  url: string;
  createdAt: string;
  postedBy: { name: string };
  votes: Array<{ id: string }>;
}

interface VoteI {
  id: string;
  link: LinkI;
}

interface Data {
  feed: {
    links: LinkI[];
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

const FEED_QUERY = gql`
  {
    feed {
      links {
        id
        createdAt
        url
        description
        postedBy {
          name
        }
        votes {
          id
        }
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
    const data = store.readQuery<Data>({ query: FEED_QUERY });

    let votedLink = data.feed.links.find(link => link.id === linkId);
    if (votedLink) {
      votedLink.votes = createdVote.link.votes;
    }
    store.writeQuery({ query: FEED_QUERY, data });
  };

  render() {
    return (
      <Query query={FEED_QUERY}>
        {({ loading, error, data }) => {
          if (loading) {
            return <div>Fetching</div>;
          }
          if (error) {
            console.dir(error);
            return <div>Error</div>;
          }
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
