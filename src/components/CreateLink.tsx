import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';
import { FEED_QUERY, DataI, LinkI } from './LinkList';
import gql from 'graphql-tag';

interface Form {
  description: string;
  url: string;
}

interface PostData {
  post: LinkI;
}

const POST_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      url
      description
    }
  }
`;

class PostMutation extends Mutation<PostData, Form> {}

class CreateLink extends Component<RouteComponentProps, Form> {
  state = {
    description: '',
    url: '',
  };

  render() {
    const { description, url } = this.state;
    return (
      <div>
        <div className="flex flex-column mt3">
          <input
            type="text"
            className="mb2"
            value={description}
            onChange={e => this.setState({ description: e.target.value })}
            placeholder="A description for the link"
          />
          <input
            type="text"
            className="mb2"
            value={url}
            onChange={e => this.setState({ url: e.target.value })}
            placeholder="The URL for the link"
          />
        </div>
        <PostMutation
          mutation={POST_MUTATION}
          variables={{ description, url }}
          onCompleted={() => this.props.history.push('/')}
          update={(store, { data: resData }) => {
            if (resData && resData.post) {
              const post = resData.post;
              const data = store.readQuery<DataI>({ query: FEED_QUERY });
              if (data && data.feed) {
                data.feed.links.unshift(post);
                store.writeQuery({
                  query: FEED_QUERY,
                  data,
                });
              }
            }
          }}
        >
          {postMutation => (
            <button onClick={e => postMutation()}>Submit</button>
          )}
        </PostMutation>
      </div>
    );
  }
}

export default CreateLink;
