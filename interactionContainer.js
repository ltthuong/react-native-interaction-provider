import React, { useContext, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import InteractionProvider, { InteractionContext } from './interactionProvider';

/**
 * A behavioral wrapper that decorates a child component with interaction detections.
 * This is helpful to determine whether or not a user is interacting with the application.
 * After a period of inactivity, `onInactive` will be fired, letting you know the application has idled.
 */
function InteractionContainer({ timeout, onActive, onInactive, children, ...props }) {
  const interactionContext = useContext(InteractionContext);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    if (interactionContext) {
      subscriptionRef.current = interactionContext.subscribe(
        timeout,
        onActive,
        onInactive
      );
    }
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, [timeout, onActive, onInactive, interactionContext]);

  const child = React.Children.only(children);
  return React.cloneElement(child, props);
}

InteractionContainer.propTypes = {
  timeout: PropTypes.number, // timeout in milliseconds
  onActive: PropTypes.func.isRequired,
  onInactive: PropTypes.func.isRequired, // called when the timer has completed
  children: PropTypes.element.isRequired,
};

InteractionContainer.defaultProps = {
  timeout: 60 * 1000, // 1m
};

function WrappedInteractionContainer(props) {
  return (
    <InteractionProvider>
      <InteractionContainer {...props} />
    </InteractionProvider>
  );
}

export default WrappedInteractionContainer;
