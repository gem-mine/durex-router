import * as ReactRouter from 'react-router'
import * as ReactRouterDom from 'react-router-dom'
import queryString from 'query-string'
import pathToRegexp from 'path-to-regexp'
import { addMiddleware, addReducer } from '@gem-mine/durex'
import Router, { routerMiddleware, createRouterReducer } from './router'
import { urlFor, router, Routes, getRouteByKeyPath, getRouteByUrlPath } from './helper'

const { Route, Redirect, Switch, Prompt, withRouter } = ReactRouter
const { Link, NavLink } = ReactRouterDom

addMiddleware(routerMiddleware())
addReducer({
  router: createRouterReducer()
})

export default {
  urlFor,
  router,
  Routes,
  getRouteByKeyPath,
  getRouteByUrlPath,

  Router,
  Route,
  Link,
  NavLink,
  Switch,
  Redirect,
  Prompt,
  withRouter,
  queryString,
  pathToRegexp,

  ReactRouter,
  ReactRouterDom
}

export { urlFor, router, Routes, getRouteByKeyPath, getRouteByUrlPath, Router, Route, Link, NavLink, Switch, Redirect, Prompt, withRouter, queryString, pathToRegexp, ReactRouter, ReactRouterDom }
