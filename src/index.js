import { Route, Redirect, Switch, Prompt, withRouter } from 'react-router'
import { Link, NavLink } from 'react-router-dom'
import queryString from 'query-string'
import pathToRegexp from 'path-to-regexp'
import { addMiddleware, addReducer } from '@gem-mine/durex'
import Router, { routerMiddleware, createRouterReducer } from './router'
import { urlFor, router, Routes } from './helper'

addMiddleware(routerMiddleware())
addReducer({
  router: createRouterReducer()
})

export default {
  urlFor,
  router,
  Routes,

  Router,
  Route,
  Link,
  NavLink,
  Switch,
  Redirect,
  Prompt,
  withRouter,
  queryString,
  pathToRegexp
}

export { urlFor, router, Routes, Router, Route, Link, NavLink, Switch, Redirect, Prompt, withRouter, queryString, pathToRegexp }
