import Router, { routerMiddleware, createRouterReducer } from './router'
import { Route, Redirect, Switch, Prompt, withRouter } from 'react-router'
import { Link, NavLink } from 'react-router-dom'
import { urlFor, router, Routes } from './helper'
import queryString from 'query-string'
import pathToRegexp from 'path-to-regexp'
import { applyMiddleware, combineReducers } from 'redux'

applyMiddleware(routerMiddleware())
combineReducers({
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
