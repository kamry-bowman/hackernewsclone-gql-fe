import React, { Component } from 'react';
import { AUTH_TOKEN } from '../constants';
import { RouteComponentProps } from 'react-router-dom';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

interface State {
  login: boolean;
  email: string;
  password: string;
  name: string;
}

interface loginData {
  login: { token: string };
}

interface signupData {
  signup: { token: string };
}
type dataResult = loginData | signupData;

const SIGNUP_MUTATION = gql`
  mutation SignupMutation($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      token
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

class Login extends Component<RouteComponentProps, State> {
  state = {
    login: true,
    email: '',
    password: '',
    name: '',
  };

  render() {
    const { login, email, password, name } = this.state;
    return (
      <div>
        <h4 className="mv3">{login ? 'Login' : 'Sign Up'}</h4>
        <div className="flex flex-column">
          {!login && (
            <input
              value={name}
              onChange={e => this.setState({ name: e.target.value })}
              type="text"
              placeholder="Your name"
            />
          )}
          <input
            type="email"
            onChange={e => this.setState({ email: e.target.value })}
            value={email}
            placeholder="Your email address"
          />
          <input
            type="password"
            onChange={e => this.setState({ password: e.target.value })}
            value={password}
            placeholder="Choose a safe password"
          />
        </div>
        <div className="flex mt3">
          <Mutation
            mutation={login ? LOGIN_MUTATION : SIGNUP_MUTATION}
            variables={{ email, password, name }}
            onCompleted={data => this._confirm(data)}
          >
            {mutation => (
              <div className="pointer mr2 button" onClick={e => mutation()}>
                {login ? 'login' : 'create account'}
              </div>
            )}
          </Mutation>
          <div
            className="pointer button"
            onClick={() => this.setState({ login: !login })}
          >
            {login ? 'need to create an account?' : 'already have an account?'}
          </div>
        </div>
      </div>
    );
  }

  _confirm = async (data: dataResult) => {
    const { token } = this.state.login
      ? (data as loginData).login
      : (data as signupData).signup;

    this._saveUserData(token);
    this.props.history.push('/');
  };
  _saveUserData = (token: string) => {
    localStorage.setItem(AUTH_TOKEN, token);
  };
}

export default Login;
