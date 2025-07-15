import React, { useContext, useState, useEffect, useRef } from 'react';
import { InteractionContext } from './interactionProvider';

/**
 * Composes a component to receive properties indicating if it is active or inactive via
 * props.active and props.inactive.
 *
 * Example:
 * function Button ({active, inactive, ...props}) { ... }
 * const ButtonWithInteractionAwareness = withInteractionProps(Button, {duration: 5000});
 *
 * @param {Component} WrappedComponent A React component to receive interaction properties.
 * @param {Object} {duration} The interaction options.
 * @returns {Component} A wrapped React component.
 */
function withInteractionProps(WrappedComponent, { duration }) {
  return function InteractionPropertyWrapper(props) {
    const interactionContext = useContext(InteractionContext);
    const [active, setActive] = useState(true);
    const [inactive, setInactive] = useState(false);
    const subscriptionRef = useRef(null);

    useEffect(() => {
      if (interactionContext) {
        subscriptionRef.current = interactionContext.subscribe(
          duration,
          () => {
            setActive(true);
            setInactive(false);
          },
          () => {
            setActive(false);
            setInactive(true);
          }
        );
      }
      return () => {
        if (subscriptionRef.current) {
          subscriptionRef.current.remove();
        }
      };
    }, [duration, interactionContext]);

    return <WrappedComponent {...props} active={active} inactive={inactive} />;
  };
}

export default withInteractionProps;
