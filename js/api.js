class HTTP {
  get = (route, body = null) => {
    return new Promise((res, rej) => {
      const requestTimeout = setTimeout(() => {
        rej("Timeout error")
      }, 10000)
      let xhr = new XMLHttpRequest()
      if (body) {
        xhr.open("GET", `${route}?data=${body}`, true)
      } else {
        xhr.open("GET", `${route}`, true)
      }

      xhr.onload = function () {
        if (this.status === 200) {
          clearTimeout(requestTimeout)
          try {
            res(JSON.parse(this.responseText))
          } catch (error) {
            res(this.responseText)
          }

        }
      }
      xhr.send(JSON.stringify(body))
    })
  }
}
