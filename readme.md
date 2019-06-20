# @gem-mine/durex-router 使用文档

## 概述

### 能力

为 @gem-mine/durex 提供 react 路由相关能力，包括了：

* 提供配置化的路由(JSON配置)进行路由注册，支持权限、子路由、默认路由、路由 redirect 等能力
* 提供路由组件Loading、404、异常配置与自定义
* 提供 hash、history、memory 形式的路由，并支持路由的跳转、后退等能力
* 提供路径解析等工具函数
* 提供 react router 内置的能力

@gem-mine/durex-router 可以认为是一个配置型的 react-router



### 依赖

@gem-mine/durex-router 依托于 react 技术栈，底层依赖包括：

* @gem-mine/durex@2 提供数据流能力，通过它将路由能力注入到数据流管理中
* react-router@4、react-router-dom@4、connected-react-router@6 提供底层 react router 和 redux 相关依赖
* path-to-regexp@3 提供路径正则匹配能力
* query-string@5 URL 路径解析能力



> 原先 @gem-mine/durex 包含了路由功能，在 @gem-mine/durex 2.x 版本中将路由相关能力独立出来，让数据流更纯粹



其中涉及了 react-router 的一些概念，在你需要深入时，可以参考：[react-router 中文文档](https://react-router.docschina.org/web/guides/philosophy)

至于 @gem-mind/durex，请参考：[@gem-mine/durex](https://github.com/gem-mine/durex)



## 快速起步

> gem-mine 提供了脚手架，已经内置了 @gem-mine/durex-router 以及其他常用的最佳实践。这里的快速起步目的在于为一般项目中集成 @gem-mine/durex-router 提供参考意义

下面我们在 create-react-app 中示范如何使用。

使用 create-react-app 创建一个项目：

```shell
create-react-app demo
```



安装 @gem-mine/durex 和 @gem-mine/durex-router

```shell
npm i @gem-mine/durex @gem-mine/durex-router -S
```



然后创建 durex.js 作为 @gem-mine/durex 的配置，在这里我们进行 @gem-mine/durex-router 的配置：

```
import router from '@gem-mine/durex-router'

// 路由模式，默认 hash，可选 browser，采用 history 模式，需要服务端支持
router.config('hash')
```



创建一个目录 route，并在其下创建 index.js 作为路由配置：

```
import React from 'react'
import { router } from '@gem-mine/durex-router'
import Layout from '../Layout'

const routes = {
  main: {
    path: '/',
    component: Layout,
    sub: {
      home: {
        index: true,
        component: () => <div>home</div>
      },
      second: {
        path: '/second',
        component: () => <div>second</div>
      }
    }
  }
}

router.register(routes) // 注册
```

这里创建了一个 main 路由，具有 home 和 second 两个子路由。子路由需要一个容器来承放，即 Layout。
两个子路由的 component 为了简便起见，直接在这里用函数组件代替。一般情况下都是在这里 import 组件，就像 Layout 一样。



然后我们补上 Layout 组件：

```
import React from 'react'
import { Routes, Link, urlFor } from '@gem-mine/durex-router'

export default props => {
  return (
    <div>
      <header>
        <ul>
          <li>
            <Link to={urlFor('main')}>到 demo 首页</Link>
          </li>
          <li>
            <Link to={urlFor('main.second')}>到 second 页</Link>
          </li>
        </ul>
      </header>
      <div>
        <Routes path="main" />
      </div>
    </div>
  )
}
```

这里用了 Routes、Link、urlFor 三个 API：

* Routes 是使用子路由，也就是在对应的区域中根据不同 url 显示 main 这个路由中的子路由
* Link 是 react-router 中的链接，进行单页跳转，详情查看 [react-router 中的 Link](https://react-router.docschina.org/web/api/Link)
* urlFor 是将对应的路由串转为路由配置中的 path 链接，例如上面的：
  * urlFor('main') 转为：/
  * urlFor('main.second') 转为：/second



然后修改项目中的 index.js：

```
import React from 'react'
import App from './App'
import { render } from '@gem-mine/durex'
import './durex' // 引入 durex 配置
import './route' // 引入 路由配置

render(<App />, document.getElementById('root'))
```



最后修改项目中的 App.js：

```
import React from 'react'
import { Router, Routes } from '@gem-mine/durex-router'

function App() {
  return (
    <Router>
      <Routes />
    </Router>
  )
}

export default App
```

这里使用 Router 和 Routes 两个 API：

* Router 是包装过 redux 数据流的组件
* Routes 没有带 path，表示整个应用所有的路由

`<Router><Routes/></Router>` 是应用入口使用路由的常见用法，表示在这里使用所有路由。



这样，你就可以项目中使用上了带数据流能力的路由。



## API 说明

### 接入

系统中接入 @gem-mine/durex-router 需要使用 config 方法，来初始化路由并设置路由的类型：

```javascript
import { config } from '@gem-mine/durex-router'

// 路由模式，默认 hash，可选 browser，采用 history 模式，需要服务端支持
config('hash')
```

这是接入 @gem-mine/durex-router 的第一步，在上面快速入门中也可以看到。



### 路由注册

通过 **router.register** 来注册路由，接受的参数是一个 object，一个相对完整的模板如下：

```jsx
import { router } from '@gem-mine/durex-router'

// 注册路由
router.register({
  login: {
    path: LOGIN_PATH,
    component: Login,
    description: '登录页',
    index: true // 根路由下默认显示
  },
  main: {
    path: '/',
    permission: props => {
      if (getIn(props, 'user.token')) {
        return true
      }
      return <Redirect to={{ pathname: LOGIN_PATH }} />
    },
    // 子路由
    sub: {
      home: {
        path: '/home',
        component: Home,
        description: '首页',
        index: true // 子路由如果要默认显示，path 设置成 /，并且设置 exact: true。或者设置 index 为 true
      },
      about: {
        path: '/about',
        component: About,
        description: '关于页'
      },
      topic: {
        path: '/topics',
        redirect: 'main.topic.list',
        module: {
          // 子模块
          list: {
            description: '话题列表页',
            path: '/list',
            component: TopicList
          },
          add: {
            description: '添加话题页面',
            path: '/add',
            component: TopicAdd
          },
          detail: {
            description: '话题详细页',
            path: '/:id',
            component: TopicItem
          }
        }
      },
      admin: {
        description: '管理路由',
        path: '/admin',
        component: Admin, // 存在子路由，需要有个组件来放置路由
        permission: props => {
          if (props.user.name === ADMIN || props.user.name === SUPER) {
            return true
          }
          return false
        },
        sub: {
          dashboard: {
            path: '/dashboard',
            description: '管理首页',
            index: true, // 作为默认显示的子路由
            redirect: {
              // 带参数的 redirect
              key: 'main.admin.dashboard.x',
              params: { name: 'tom' }
            },
            module: {
              x: {
                path: '/x',
                component: X
              },
              y: {
                path: '/y',
                component: Y
              }
            }
          },
          super: {
            description: '超级管理员页面',
            path: '/super',
            component: Super,
            permission: props => {
              if (props.user.name === SUPER) {
                return true
              }
              return <Forbidden message={`请将用户名改为 ${SUPER}`} />
            }
          },
          log: {
            description: '日志',
            path: '/logs',
            module: {
              list: {
                description: '日志列表',
                path: '/',
                exact: true,
                component: LogList
              },
              detail: {
                description: '日志详情',
                path: '/:id',
                component: LogItem
              }
            }
          }
        }
      }
    }
  }
})
```

路由中的每一项，可能由下面的若干个配置构成：

- path: 路由对应的 url 地址，嵌套的路由（包括 sub 和 module）会祖先路由的 path 作为前缀拼接

- component：路由对应的组件

- permission：权限拦截函数，返回 true 表示有权限。返回 false 则渲染默认无权限组件，返回一个组件时是表示无权限对应的自定义组件。嵌套的路由会继承祖先的 permission 权限拦截函数，因此只有祖先 permission 返回 true 后才会进入目标路由

- description：描述，可选，相当于一个注释作用

- index：是否作为默认子路由。默认路由是针对 sub 的，当给某个 sub 的元素指定 index:true 时，如果 url 对应的是父路由的 path，该子路由会作为默认显示。例如上面的配置，当访问 / 时，permission 通过时，由于其 home 子路由具有 index:true，因此会默认显示 home 对应的内容。当然，访问 /home 也是一样显示 home。

  默认路由还有另外一种写法，即子路由的 path 为 / 时，就是作为默认子路由显示，此时通常需要增加一个 exact:true 防止路由冲突，例如上面配置中的 main.admin.log.list。

  如果是 module，想默认进入某个路由，可以使用 redirect 进行跳转。

- redirect：进入该路由后自动跳转到指定路由。**注意：redirect 不能和 sub 同级别存在，也就是某一项路由中，redirect 和 sub 不能同时存在**，因为如果 redirect 的目标是自己的子路由，而子路由渲染必然需要经过祖先路由，又会触发 redirect，从而死循环。虽然 redirect 一般是结合 module 使用，表示跳转进入某个平级路由，但 redirect 其实是可以跳转进入任意的其他路由。

- sub：子路由，其下配置也是一个路由配置

- module：平级模块路由，其下配置也是一个路由配置。module 只是为了较少 path 和 permission 书写而已。

- exact：唯一匹配，否则”/“和”/page1”都会匹配到 path 为"/"的路由，制定 exact 后，"/page1"就不会再匹配到"/"了

> 注意：路由的 path 如果出现重复，则以第一个注册的组件为准生效，同时将会在浏览器控制台进行警告提示 路由 path 被重复注册。



### 路由通用配置

通过 **router.config** 来设置路由通用配置，用于设置路由加载、失败、无权限默认组件配置：

```js
import { router } from '@gem-mine/durex-router'
import NotFound from 'component/status/404'
import Forbidden from 'component/status/403'
import Loading from 'component/status/Loading'

// 通用配置
router.config({
  // 设置默认的 403，404 组件
  components: {
    NotFound,
    Forbidden,
    Loading
  }
})
```

### redux 能力

当 @gem-mine/durex-router 接入后，会往 @gem-mine/durex 的 actions 中注入 router 对象，该对象上的方法可以用来更新 location 相关操作：

- push(url)： 往 history 中添加一条记录，并跳转到目标 url（浏览器具有后退功能）
- replace(url)： 替换 hisotry 中当前 url（替换当前 url，不会加入浏览器历史栈）
- go()：往前或者往后跳转
- goForward()：往前跳转一条历史记录，等价于 go(1)。
- goBack()：往后跳转一条历史记录，等价于 go(-1)。

这些方法来自于 history API，意义和用法完全一致。不过与原生方法不同的是，调用 actions.router 上的这些方法，在更新 location 的同时，你的 routing 与 Redux store 将会保持同步，同时一个 type 为 `@@router/LOCATION_CHANGE` 的 action 会被 dispatch。



### 组件中使用路由组件

通过 Routes 组件来使用指定的路由，会在某些组件中使用。使用 Routes 的区域就会响应路由地址的变化而加载对应的路由组件。

通常在 react-router 中会通过 Router、Route、Switch 来在组件中拼装对应的路由和组件，由于 @gem-mine/durex-router 提供了 JSON 配置，因此提供了 Routes 来将路由快速集成到组件中。

Routes 的用法包括：

```
// 加载所有子路由，通常在应用入口时使用
<Routes /> 

// 加载对应子路由
<Routes path="some.path" />
```



* 使用 `<Routes />` 来加载所有路由

```
import { Router, Routes } from '@gem-mine/durex-router'

export default class App extends React.Component {
  render() {
    return (
      <div className="app">
        <Router>
          <Routes />
        </Router>
      </div>
    )
  }
}
```



* 使用 `<Routes path="some.path" />` 来加载对应子路由 

```
import { Routes } from '@gem-mine/durex-router'

export default class SomeComponent extends React.Component {
  render() {
    return (
      <div>
        <Routes path="some.path"/>
      </div>
    )
  }
}
```

path 时 register 中的 JSON 的 key 的路径，比如上面的 main.home，main.admin.dashboard.x



### 工具函数

@gem-mine/durex-router 提供了一些方面操作路由、URL 相关的工具函数，包括：

* urlFor：将配置的路由生成 url，会自动处理路由参数还是查询参数

  假设有下面的几种情况（简化说明，只保留 path）：

  ```json
  {
    main: {
      path: '/',
      sub: {
        home: {
          path: '/home'
        },
        user: {
          path: '/user/:id'
        }
      }
    }
  }
  ```

  

  ```js
  import { urlFor } from '@gem-mine/durex-router'
  
  // 生成 /home
  urlFor('main.home')
  
  // 生成 /home?id=1000
  urlFor('main.home', { id: 1000 })
  
  // 生成 /user/1000
  urlFor('main.user', { id: 1000 })
  
  // 生成 /user/1000?age=22
  urlFor('main.home', { id: 1000, age: 22 }) 
  ```



* queryString：解析 URL 参数

  ```javascript
  import { queryString } from '@gem-mine/durex-router'
  
  // 解析查询参数
  queryString.parse(url)
  
  // 生成 url
  queryString.stringify(url, {
    // ...
  })
  ```

  更详细用法请查看：[queryString](https://github.com/sindresorhus/query-string)



* pathToRegexp：将路径转为正则表达式

  ```javascript
  import { pathToRegexp } from '@gem-mine/durex-router'
  const path = '/topics/:id'
  
  // 生成的正则可以验证某个 url 是否满足规则
  const reg = pathToRegexp(path)
  reg.test('/topics/1000') // true
  ```

  更详细用法请查看：[queryString](https://github.com/sindresorhus/query-string)



* 获取路由配置

  * getRouteByKeyPath：通过 key path 获取路由配置

    ```javascript
    import { getRouteByKeyPath } from '@gem-mine/durex-router'
    
    const route = getRouteByKeyPath('main.home') // 返回 main.home 路由配置
    // route 得到 {path: '/home', component:...}
    ```

    

  * getRouteByUrlPath：通过 url path 获取路由配置

    ```javascript
    import { getRouteByUrlPath } from '@gem-mine/durex-router'
    
    const route = getRouteByUrlPath('/home') // 找到 /home 对应的路由，然后返回其配置
    // route 得到 {path: '/home', component:...}
    ```

    

* 常用的 react-router API：

  * withRouter：要在组件中获取路由信息时，需要使用 withRouter 来包裹组件：

    ```jsx
    import { withRouter } from '@gem-mine/durex-router'
    
    @withRouter
    class SomeComponent extends React.Component {
      // ....
    }
    ```

    更多信息可以查看：[react-router withRouter](https://react-router.docschina.org/web/api/withRouter)

  * Link：用于路由跳转，可以结合 urlFor 使用：

    ```jsx
    import { Link, urlFor } from '@gem-mine/durex-router'
    
    class SomeComponent extends React.Component {
      render() {
        <>
          <Link to={urlFor('some.path')} />
        </>
      }
    }
    ```

     

## 最佳实践

### 路由目录

通常我们会用一个目录来放路由，这个目录一般叫 route 或者 routes，然后在其下放置 index.js 作为路由入口文件。我们在这个文件进行 router.register 路由注册。

当路由增加时，将所有路由都放在 index.js 容易使得改文件变得臃肿，即不容易维护，还容易造成多人协作时的代码冲突。因此通常我们会根据功能将其拆分，然后利用 js 模块将其引入到 index.js。例如：

```
import topicRoutes from './topic'
import adminRoutes from './admin'
import loginRoutes from './login'

router.register({
  login: loginRoutes,
  main: {
    path: '/',
    sub: {
      home: {
        path: '/home',
        component: Home,
        description: '首页',
        index: true
      },
      topic: topicRoutes,
      admin: adminRoutes
    }
  }
})
```

而这些功能拆分的路由，同样只是一个简单的 json，例如 topic.js：

```
export default {
  path: '/topics',
  redirect: 'main.topic.list',
  // 子模块
  module: {
    list: {
      description: '话题列表页',
      path: '/list',
      component: TopicList
    },
    add: {
      description: '添加话题页面',
      path: '/add',
      component: TopicAdd
    },
    detail: {
      description: '话题详细页',
      path: '/:id',
      component: TopicItem
    }
  }
}
```



### 异步加载

减小首屏 js 大小的一个重要手段是代码分割（code splitting），可以通过 webpack 进行。其中很重要的手段是动态导入，结合路由来做代码分割是一种通用做法。



通过结合 react-loadable，可以提供一种通用的路由按需加载的方案：

```jsx
import loadable from 'react-loadable'

export function asyncLoader(modulePath) {
  const LoadableComponent = loadable({
    loader: () => import(
      /* webpackInclude: /(page|component).*\.((j|t)sx?)$/ */
      `../${modulePath}`
    ),
    loading: ({ isLoading, error }) => {
      if (isLoading) {
        return <Loading />
      } else if (error) {
        return <Error />
      } else {
        return null
      }
    }
  })
  return function Loadable() {
    return <LoadableComponent />
  }
}
```

上面代码中有几点需要注意的：

* webpackInclude：这是为了提高 webpack 编译性能，缩小查找组件的范围。这个在 webpack 中称为 magic comment，可以参见：[webpack magic comment](https://webpack.docschina.org/api/module-methods/#magic-comments)
* Loading、Error 组件请自行实现，分别表示路由加载中和路由加载失败的组件

使用时，可以在路由配置中使用，例如：

```jsx
import React from 'react'
import { router } from '@gem-mine/durex-router'
import Layout from '../Layout'
import { asyncLoader } from '../util/loader'

const routes = {
  main: {
    path: '/',
    component: Layout,
    sub: {
      login: {
        index: true,
        component: asyncLoader('user/Login')
      },
      home: {
        path: '/home',
        component: asyncLoader('user/Home')
      }
    }
  }
}

router.register(routes)
```

附大致的目录结构：

```text
|-src
  |-route
    |-index.js
  |-page
     |-user
        |-Login.jsx
        |-Home.jsx
  |-util
     |-loader.js
```



### 权限处理

权限处理是通过 permission 这个方法实现，该方法会被子路由(sub) 以及 平级模块(module) 继承。该方法返回一个 boolean 值，true 表示有权限渲染对应的路由，false 表示无权限渲染配置的 Forbidden 组件。

如果一个路由组件自身以及祖先路由上都存在 permission，会从祖先往下逐个执行 permission，只有全部通过才是有权限。

一般地，我们会在某个祖先级别写上 permisson，使其所有子路由都要通过其权限验证，例如管理后台情况。

另外，虽然 permission 支持异步写法，但不建议这么做，进入路由时都会执行 permission，如果是异步的情况会导致路由加载时间变长。所以，尽可能将异步校验行为提到外部来做，并且缓存校验的结果提供给 permission。





## 常见问题

### 如何在一个组件中获得路由相关信息

一个组件如果需要路由信息，需要使用 withRouter，然后你就可以在组件的 props 中拿到：

```javascript
import { withRouter } from '@gem-mine/durex-router'

@withRouter
class SomeComponent extends React.Component {
  render() {
    // this.props 中可以拿到路由相关信息，包括 location/match 等
  }
}
```

* location：location 对象 代表应用程序现在在哪，你想让它去哪，或者甚至它曾经在哪。通常我们会从它这里拿：

  * pathname：url 的路径

  * search：url 的查询参数。hash 模式下匹配的是 hash 后面的 search。拿到 search 后通常需要使用 queryString 转为对象

    ```javascript
    import { withRouter, queryString } from '@gem-mine/durex-router'
    
    @withRouter
    class SomeComponent extends React.Component {
      render() {
        const params = queryString.parse(this.props.location.search)
        // ...
      }
    }
    ```

  * hash：hash值。在 hash 模式下的路由中，这个值为空，所以一般不使用。

  更多信息参见：[react-router location](https://react-router.docschina.org/web/api/location)

* match：match 对象包涵了有关如何匹配 URL 的信息。包括：

  * params：
  * isExact：`true` 如果匹配整个 URL （没有结尾字符）
  * path：用于匹配的路径模式。被嵌套在 `<Route>` 中使用
  * url：用于匹配部分的 URL 。被嵌套在 `<Link>` 中使用

* history：较少使用，是 react-router 中的 history 包，可以参见：[react-router 中的 history](https://react-router.docschina.org/web/api/history)



### 如何进行路由的通用处理

在使用了 @gem-mine/durex-router 后，可以通过 @gem-mine/durex 的 hook 进行通用处理：

```
durex.hook((action, getState) => {
  if (action.type === '@@router/LOCATION_CHANGE') {
    // 路由变化时会进入到这里
  }
})
```



### Routes、Route、Router、router 的区别

* Routes 是为了在组件中使用子路由而存在，它实现了将路由配置转为 react-router 的路由组件。这是 @gem-mine/durex-router 的组件

* Route 是 react-router 提供的组件，它提供了匹配 url 进行指定 component 渲染的能力。这个组件已经被 @gem-mine/durex-router 内部调用，一般情况下不需要开发者去使用。更详细说明请参考：[react-router 中的 Route](https://react-router.docschina.org/web/api/Route)

* Router
  首先，@gem-mine/durex-router 中的 Router 不是 react-router 中的 Router。react-router 中的 Router 可以具象为 BrowserRouter、HashRouter、MemoryRouter 等组件，Router 作为它们的底层组件。具体可以参考：[react-router 中的 Router](https://react-router.docschina.org/web/api/Router)

  而我们这里讲的 Router 是 @gem-mine/durex-router 提供的，它提供了结合 redux 数据流的能力，其本质是 connected-react-router 提供的 ConnectedRouter

  ```
  function Router({ children }) {
    return <ConnectedRouter history={history}>{children}</ConnectedRouter>
  }
  ```

* router 是 @gem-mine/durex-router 提供一个工具集，主要包括了：

  * config：对 @gem-mine/durex-router 进行配置，例如加载时的组件、异常时的组件

  * register：注册路由的接口，大家配置的路由就是通过 router.register({…}) 进行注册

    

### sub 和 module 的区别

sub 和 module 都属于嵌套路由，会从祖先路由那里继承到 path 和 permission。其区别在于 sub 是子路由，需要一个容器作为承载，路由变化时，只有指定部分的内容会发生变化。 module 我们称之为平级模块，只是为了较少 path 和 permission 书写而已。module 无论嵌套多少级他们之间都是平级的，是共享操作一个区域的内容。

子路由 sub 被 `<Routes>` 组件接收，放在某些组件中（这些组件成为路由容器，承担布局等能力）。是这样使用的：

```js
// 使用顶级路由
<Routes/>

// 使用某个子路由
<Routes path="main.admin"/>
```

module 并不会有这样的用法，它没有路由容器这个概念。



### 怎么进行跳转、后退

跳转一般使用 Link 组件进行：

```
<Link to={urlFor('some.path')} />
```



在 js 中可以使用 actions.router.push 进行：

```
actions.router.push('/some/path')
```



后退使用 actions.router.goBack()

```
actions.router.goBack()
```



## 版本历史

* 1.3.0：enhance：路由模式配置由自身实现，不依赖于 @gem-mine/durex
* 1.2.1：fixbug：修改_cache筛选机制
* 1.2.0：enhance：增加 api getRouteByKeyPath, getRouteByUrlPath 并暴露 ReactRouter, ReactRouterDom 对象
* 1.1.3：fixbug：loading component 赋值不成功
* 1.1.2：enhance：路由重复注册检测优化
* 1.1.1：fixbug：注册到 redux 需要将 routing 改为 router
* 1.1.0：enhance：路由组件去除 connect，避免多次渲染；同时 permission 支持异步写法
* 1.0.3：路由组件去除 connect,permission 支持异步
* 1.0.2：更新依赖
* 1.0.1：通过 addMiddleware, addReducer 集成到 @gem-mine/durex
* 1.0.0：从 @gem-mine/durex 剥离

## 后续计划

- 添加单元测试用例
- 添加 typescript 支持
- 升级 react-router@5