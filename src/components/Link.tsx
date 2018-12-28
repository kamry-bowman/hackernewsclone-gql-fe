import React, { Component } from 'react';

interface LinkProps {
  link: {
    description: string;
    url: string;
    id: string;
  };
}

class Link extends Component<LinkProps> {
  render() {
    return (
      <div>
        <div>
          {this.props.link.description} ({this.props.link.url})
        </div>
      </div>
    );
  }
}

export default Link;
