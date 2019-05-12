import React from 'react'
import { Route, Switch, Redirect } from 'react-router'
import pathToRegexp from 'path-to-regexp'
import queryString from 'query-string'
import { smart } from '@gem-mine/durex'

const ROOT = '__root__'

// 缓存拍扁的路由信息
const _routers = {}
// 缓存拍扁的子路由
const _sub = {
  [ROOT]: [] // 根的子路由
}
// 缓存 config
const _config = {
  components: {
    NotFound: props => {
      return <div>404 not found</div>
    },
    Forbidden: props => {
      return <div>403 forbidden</div>
    }
  }
}

// 缓存，key 是路径，用来检测该路径是否被注册，如果重复注册，用来警告
const _cache = {}

function parseRedirect(route) {
  let to = route.redirect
  // 有子路由的不处理 redirect，防止是跳转进入子路由引起死循环
  if (!route.sub && to) {
    if (typeof to === 'object') {
      to = urlFor(to.key, to.params)
    } else {
      const t = _routers[to]
      if (t) {
        to = t.path
      } else {
        console.warn(`route ${route.redirect} not exist, redirect fail, please check route config`)
      }
    }
    if (to) {
      if (route.path !== to) {
        return <Redirect exact from={route.path} to={to} key={route.key} />
      }
    }
  }
}

/**
 * 添加一个路由
 */
function add(parent, items) {
  let keyPath = ''
  let pathPrefix = ''
  if (parent) {
    if (parent.keyPath) {
      keyPath = `${parent.keyPath}.${parent.key}`
    } else {
      keyPath = parent.key
    }
    if (parent.path && parent.path !== '/') {
      pathPrefix = parent.path
    }
  }
  Object.keys(items).forEach(key => {
    const item = items[key]
    item.key = key
    item.keyPath = keyPath
    if (item.path) {
      item.path = `${pathPrefix}${item.path}`.replace(/\/\/|\/$/g, '') || '/'
    } else {
      item.path = '/'
      if (item.component) {
        item.exact = true
      }
    }
    let subKey = ROOT
    if (parent) {
      item.parent = parent
      const kp = getParentKeyPath(keyPath)
      // 祖先存在是子路由, 应往最近的具有子路由的祖先中添加
      if (kp) {
        subKey = kp
      }
    }
    _sub[subKey].push(item)
    const selfPath = keyPath ? `${keyPath}.${item.key}` : item.key
    _routers[selfPath] = item

    if (item.index) {
      let target = { ...item }
      delete target.index
      if (item.component) {
        target.path = pathPrefix || '/'
        target.exact = true
      } else if (item.redirect) {
        target = {
          key: item.parent.key,
          path: item.parent.path,
          redirect: item.redirect
        }
      }
      _sub[subKey].push(target)
    }

    // 具有子路由
    if (item.sub) {
      _sub[selfPath] = []
      add(item, item.sub)
    }
    // 具有子模块
    if (item.module) {
      add(item, item.module)
    }

    if (_cache[item.path]) {
      console.warn(`${item.path} 已经被注册，生效的是首个注册的组件：`, _cache[item.path], `当前组件不生效：`, item)
    } else {
      if (item.component && !item.index) {
        _cache[item.path] = item
      }
    }
  })
}

function getParentKeyPath(keyPath) {
  const arr = keyPath.split('.')
  let i = arr.length
  let p
  while (i >= 0) {
    const key = arr.slice(0, i).join('.')
    p = _sub[key]
    if (p) {
      return key
    }
    i -= 1
  }
  return false
}

const Permission = receiveProps => {
  const { component: Component, permission, ...rest } = receiveProps
  return (
    <Route
      {...rest}
      render={props => {
        let p = receiveProps
        let arr = []
        while (p) {
          if (typeof p.permission === 'function') {
            arr.push(p.permission)
          }
          p = p.parent
        }

        let flag = true
        for (let i = 0; i < arr.length; i++) {
          flag = arr[i](receiveProps)
          if (flag !== true) {
            break
          }
        }
        if (flag === true) {
          // 合法
          return <Component {...props} />
        } else {
          // 不合法
          if (flag) {
            // 验证函数返回Component，直接显示
            return flag
          }
          return <_config.components.Forbidden {...props} />
        }
      }}
    />
  )
}

/**
 * 解析 url
 * @param {String} key，对应路由定义中的 key
 * @param {Object} params 参数列表，url中有的替换，没有的作为查询参数
 */
export function urlFor(key, params) {
  const router = _routers[key]
  if (!router) {
    console.warn(`router: ${key} not register`)
    return ''
  }

  const { path } = router
  if (!params) {
    return path
  }

  const keys = []
  pathToRegexp(path, keys)

  let url = path
  const temp = {}
  keys.forEach(item => {
    const { name, prefix } = item
    if (params.hasOwnProperty(name)) {
      url = url.replace(new RegExp(`${prefix}(:${name})\\/?`, 'g'), function (str, match) {
        return str.replace(match, params[name])
      })
      temp[name] = true
    } else {
      console.error(`${path}: ${name} missing value`)
    }
  })

  const obj = {}
  Object.keys(params).forEach(key => {
    if (!temp.hasOwnProperty(key)) {
      obj[key] = params[key]
    }
  })

  const c = url.indexOf('?') > -1 ? '&' : '?'

  url = `${url}${c}${queryString.stringify(obj)}`
  return url
}

export const Routes = props => {
  const { path, children } = props // eslint-disable-line
  let rs
  let mapStateToProps = props.mapStateToProps // eslint-disable-line
  if (!mapStateToProps) {
    mapStateToProps = _config.mapStateToProps
  }
  const PermissionRoute = smart(mapStateToProps)(Permission)
  if (path) {
    rs = _sub[path]
  } else {
    rs = _sub.__root__
  }

  if (rs && rs.length) {
    const routes = []
    const redirects = []

    rs.forEach(route => {
      if (route) {
        if (route.redirect) {
          redirects.push(parseRedirect(route))
        } else if (route.component) {
          routes.push(<PermissionRoute {...route} key={route.key} />)
        }
      }
    })

    return (
      <Switch>
        {routes}
        {redirects}
        {children}
        <Route component={_config.components.NotFound} />
      </Switch>
    )
  }
}

export const router = {
  // 配置
  config(params) {
    const { mapStateToProps, components } = params
    _config.mapStateToProps = mapStateToProps
    if (components) {
      const { NotFound, Forbidden } = components
      if (NotFound) {
        _config.components.NotFound = NotFound
      }
      if (Forbidden) {
        _config.components.Forbidden = Forbidden
      }
    }
  },
  // 路由统一注册入口
  register(keyPath, items, isSub) {
    if (typeof keyPath === 'object') {
      items = keyPath
      keyPath = ''
    }
    const parent = _routers[keyPath]

    add(parent, items)
  },
  Routes,
  getFlat() {
    return _routers
  },
  getSub(key) {
    if (!key) {
      key = ROOT
    }
    return _sub[key]
  }
}
