import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { compose } from 'redux';
import QUERY_OPEN_MESSAGE_THREAD from '../../graphql/queries/message-threads/open-thread.graphql';
import QUERY_USER_ID from '../../graphql/queries/user/id.graphql';
import MESSAGE_CREATED_SUBSCRIPTION from '../../graphql/subscriptions/messages/message-created.graphql';
import { MESSAGES_ROUTE } from '../../constants';
import Loader from '../../components/Layout/Loader';
import Headroom from '../../components/Messages/OpenMessageThread/Headroom';
import Messages from '../../components/Messages/OpenMessageThread/Messages';
import MessageInput from '../../components/Messages/OpenMessageThread/MessageInput';

/**
 * @class OpenMessageThread
 * @extends {React.PureComponent}
 */
class OpenMessageThread extends React.PureComponent {
  /**
   * @returns {undefined}
   */
  componentDidMount() {
    this.props.openMessageThread.subscribeToMore({
      document: MESSAGE_CREATED_SUBSCRIPTION,
      variables: {
        currentUserId: this.props.userIdQuery.user && this.props.userIdQuery.user.id,
      },
      updateQuery: (prev, { subscriptionData: { data } }) => {
        if (
          !data
          || !data.messageCreated
          || !data.messageCreated
          || data.messageCreated.threadId !== this.props.openMessageThread.data.id
        ) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            messages: [...prev.data.messages, data.messageCreated],
          },
        };
      },
    });
  }
  /**
   * @returns {undefined}
   */
  componentDidUpdate() {
    if (!this.props.openMessageThread.loading && !this.props.openMessageThread.data) {
      this.props.history.push(MESSAGES_ROUTE);
    }
  }
  /**
   * render
   * @returns {JSX.Element} HTML
   */
  render() {
    if (!this.props.openMessageThread.data) {
      return (
        <div className="full-height flex-center">
          <Loader />
        </div>
      );
    }
    return (
      <div className="full-height flex-column">
        <Headroom user={this.props.openMessageThread.data.user} />
        <Messages
          currentUserId={this.props.userIdQuery.user.id}
          messages={this.props.openMessageThread.data.messages}
        />
        <MessageInput user={this.props.openMessageThread.data.user} />
      </div>
    );
  }
}

OpenMessageThread.propTypes = {
  history: PropTypes.shape(),
  userIdQuery: PropTypes.shape({
    user: PropTypes.shape({ id: PropTypes.number }),
  }),
  openMessageThread: PropTypes.shape({
    loading: PropTypes.bool,
    data: PropTypes.shape({
      id: PropTypes.number,
      user: PropTypes.shape(),
      messages: PropTypes.arrayOf(PropTypes.shape()),
    }),
    subscribeToMore: PropTypes.func,
  }),
};

export default compose(
  graphql(
    QUERY_USER_ID,
    { name: 'userIdQuery' },
  ),
  graphql(
    QUERY_OPEN_MESSAGE_THREAD,
    {
      name: 'openMessageThread',
      options: props => ({
        variables: { threadId: props.match.params.threadid },
      }),
    },
  ),
)(OpenMessageThread);