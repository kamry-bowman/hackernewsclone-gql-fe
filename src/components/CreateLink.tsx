import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

interface Form {
  description: string;
  url: string;
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

class PostMutation extends Mutation<{}, Form> {}

class CreateLink extends Component<{}, Form> {
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
        <PostMutation mutation={POST_MUTATION} variables={{ description, url }}>
          {postMutation => (
            <button onClick={e => postMutation()}>Submit</button>
          )}
        </PostMutation>
      </div>
    );
  }
}

export default CreateLink;
