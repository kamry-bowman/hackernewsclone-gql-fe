import React, { Component } from 'react';
import { withApollo, WithApolloClient } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';
import gql from 'graphql-tag';
import { LinkI, DataI } from './LinkList';
import Link from './Link';

interface SearchState {
  links: LinkI[];
  filter: string;
}

const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
      links {
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
  }
`;

class Search extends Component<
  WithApolloClient<RouteComponentProps>,
  SearchState
> {
  state = {
    links: [],
    filter: '',
  };

  _executeSearch = async () => {
    const { filter } = this.state;
    const result = await this.props.client.query<DataI>({
      query: FEED_SEARCH_QUERY,
      variables: { filter },
    });
    const links = result.data.feed.links;
    this.setState({ links });
  };

  render() {
    return (
      <div>
        <div>
          Search
          <input
            type="text"
            onChange={e => this.setState({ filter: e.target.value })}
          />
          <button onClick={() => this._executeSearch()}>OK</button>
        </div>
        {this.state.links.map((link: LinkI, index: number) => (
          <Link
            key={link.id}
            link={link}
            index={index}
            updateStoreAfterVote={() => {}}
          />
        ))}
      </div>
    );
  }
}

export default withApollo(Search);
