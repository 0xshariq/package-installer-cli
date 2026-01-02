package actions

import "github.com/gobuffalo/buffalo"

func App() *buffalo.App {
	app := buffalo.New(buffalo.Options{})
	app.GET("/", func(c buffalo.Context) error {
		return c.Render(200, r.String("Hello Buffalo"))
	})
	return app
}
