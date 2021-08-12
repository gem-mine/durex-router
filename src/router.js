import React from 'react'
import { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history'
import { ConnectedRouter, routerActions, CALL_HISTORY_METHOD, connectRouter } from 'connected-react-router'
import { actions, addMiddleware, addReducer } from '@gem-mine/durex'

let history = null

/**
 * @param opts: hash/browser/memory/{mode: hash/browser/memory, basename:}
 * @returns History
 */
export function createHistory(opts) {
  // 兼容历史错误，opts 应该是个对象，但中间版本是 string，导致路由模式只能是 hash
  const mode = typeof opts === 'object' ? opts.mode : opts
  if (!history) {
    const type = mode || 'hash'
    if (['hash', 'memory', 'browser'].indexOf(type) === -1) {
      console.error('mode should be one of hash/memory/browser')
    } else {
      const historyModes = {
        browser: createBrowserHistory,
        hash: createHashHistory,
        memory: createMemoryHistory
      }
      history = historyModes[type](opts)
    }

    addMiddleware(routerMiddleware())
    addReducer({
      router: connectRouter(history)
    })
  }

  return history
}

/**
 * `createHistory(opts)` alias `router.config(opts)`
 */
export const config = createHistory

function routerMiddleware() {
  return ({ getState, dispatch }) => {
    // Add `push`, `replace`, `go`, `goForward` and `goBack` methods to actions.routing,
    // when called, will dispatch the crresponding action provided by react-router-redux.
    actions.router = Object.keys(routerActions).reduce((memo, action) => {
      memo[action] = (...args) => {
        dispatch(routerActions[action](...args))
      }
      return memo
    }, {})
    return next => action => {
      if (action.type !== CALL_HISTORY_METHOD) {
        return next(action)
      }

      const {
        payload: { method, args }
      } = action
      history[method](...args)
    }
  }
}

export default function Router({ children }) {
  // ConnectedRouter will use the store from Provider automatically
  return <ConnectedRouter history={history}>{children}</ConnectedRouter>
}
