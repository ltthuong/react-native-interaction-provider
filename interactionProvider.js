import React, { createContext, useRef, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { PanResponder } from 'react-native';
import InteractionSubscription from './subscription';

// Create the context
export const InteractionContext = createContext();

/**
 * A provider component exposing a subscribable context allowing components to observe changes in inactivity
 * by observing interaction gestures with the child component.
 */
function InteractionProvider({ children }) {
  const subscriptionsRef = useRef([]);
  const panResponderRef = useRef(null);

  // Subscription methods
  const subscribe = (duration, onActive, onInactive) => {
    const subscription = new InteractionSubscription(duration, onActive, onInactive);
    subscriptionsRef.current.push(subscription);
    subscription.refreshTimeout();
    return {
      remove: () => {
        const index = subscriptionsRef.current.indexOf(subscription);
        subscription.clearTimeout();
        if (index > -1) {
          subscriptionsRef.current.splice(index, 1);
        }
      },
    };
  };

  const subscribeForInactivity = (duration, onInactive) => subscribe(duration, null, onInactive);
  const subscribeForActivity = (duration, onActive) => subscribe(duration, onActive, null);

  // PanResponder logic
  const onPanResponderCapture = () => {
    subscriptionsRef.current.forEach((subscription) => {
      if (!subscription.isPending()) {
        subscription.active();
      }
      subscription.refreshTimeout();
    });
    return false;
  };

  // Setup PanResponder once
  if (!panResponderRef.current) {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => onPanResponderCapture(),
      onMoveShouldSetPanResponderCapture: () => onPanResponderCapture(),
    });
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach((subscription) => subscription.clearTimeout());
      subscriptionsRef.current = [];
    };
  }, []);

  // Context value
  const contextValue = useMemo(
    () => ({
      subscribe,
      subscribeForActivity,
      subscribeForInactivity,
    }),
    []
  );

  // Decorate the child node with the pan handlers
  return (
    <InteractionContext.Provider value={contextValue}>
      {React.cloneElement(children, {
        ...panResponderRef.current.panHandlers,
      })}
    </InteractionContext.Provider>
  );
}

InteractionProvider.propTypes = {
  children: PropTypes.element.isRequired,
};

export default InteractionProvider;
