import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Link from './Link';

interface LinkI {
  id: string;
  description: string;
  url: string;
  createdAt: string;
  postedBy: { name: string };
  votes: Array<{ id: string }>;
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
                <Link key={link.id} link={link} index={i} />
              ))}
            </div>
          );
        }}
      </Query>
    );
  }
}

export default LinkList;
