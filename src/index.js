import * as ReactRouter from 'react-router'
import * as ReactRouterDom from 'react-router-dom'
import queryString from 'query-string'
import pathToRegexp from 'path-to-regexp'
import Router, { config } from './router'
import { urlFor, router, Routes, getRouteByKeyPath, getRouteByUrlPath } from './helper'

const { Route, Redirect, Switch, Prompt, withRouter } = ReactRouter
const { Link, NavLink } = ReactRouterDom

export default {
  config,

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

export { config, urlFor, router, Routes, getRouteByKeyPath, getRouteByUrlPath, Router, Route, Link, NavLink, Switch, Redirect, Prompt, withRouter, queryString, pathToRegexp, ReactRouter, ReactRouterDom }
