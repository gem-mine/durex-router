import React from 'react'
import { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history'
import { ConnectedRouter, routerActions, CALL_HISTORY_METHOD, connectRouter } from 'connected-react-router'
import { dispatch, actions, options } from '@gem-mine/durex'

// Add `push`, `replace`, `go`, `goForward` and `goBack` methods to actions.routing,
// when called, will dispatch the crresponding action provided by react-router-redux.
actions.routing = Object.keys(routerActions).reduce((memo, action) => {
  memo[action] = (...args) => {
    dispatch(routerActions[action](...args))
  }
  return memo
}, {})

let history = null

function _createHistory(opts) {
  if (!history) {
    let type = options.historyMode || 'hash'
    if (['hash', 'memory', 'browser'].indexOf(type) === -1) {
      console.error('hashType should be one of hash/memory/browser')
    } else {
      const historyModes = {
        browser: createBrowserHistory,
        hash: createHashHistory,
        memory: createMemoryHistory
      }
      history = historyModes[type](opts)
      return history
    }
  }
}

export function createRouterReducer() {
  _createHistory()
  return connectRouter(history)
}

export function routerMiddleware() {
  _createHistory()
  return () => next => action => {
    if (action.type !== CALL_HISTORY_METHOD) {
      return next(action)
    }

    const {
      payload: { method, args }
    } = action
    history[method](...args)
  }
}

export default function Router({ children }) {
  _createHistory()

  // ConnectedRouter will use the store from Provider automatically
  return <ConnectedRouter history={history}>{children}</ConnectedRouter>
}
