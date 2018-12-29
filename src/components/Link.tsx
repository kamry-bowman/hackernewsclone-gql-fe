import React, { Component } from 'react';
import { AUTH_TOKEN } from '../constants';
import { timeDifferenceForDate } from '../utils';

interface LinkProps {
  index: number;
  link: {
    description: string;
    url: string;
    id: string;
    createdAt: string;
    postedBy: { name: string };
    votes: Array<{ id: string }>;
  };
}

class Link extends Component<LinkProps> {
  _voteForLink() {
    return;
  }
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN);

    return (
      <div className="flex mt2 items-start">
        <div className="flex items-center">
          <span className="gray">{this.props.index + 1}.</span>
          {authToken && (
            <div className="ml1 gray fll" onClick={() => this._voteForLink()}>
              ▲
            </div>
          )}
        </div>
        <div className="ml1">
          <div>
            {this.props.link.description} ({this.props.link.url})
          </div>
          <div className="f6 lh-copy gray">
            {this.props.link.votes.length} votes | by{' '}
            {this.props.link.postedBy
              ? this.props.link.postedBy.name
              : 'Unknown'}{' '}
            {timeDifferenceForDate(new Date(this.props.link.createdAt))}
          </div>
        </div>
      </div>
    );
  }
}

export default Link;
