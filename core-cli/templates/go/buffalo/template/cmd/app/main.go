package main

import "buffalo-starter/actions"

func main() {
	app := actions.App()
	app.Serve()
}
