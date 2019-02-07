workflow "Build and test" {
  on = "push"
  resolves = ["test"]
}

action "npm install" {
  uses = "actions/npm@3c8332795d5443adc712d30fa147db61fd520b5a"
  runs = "npm"
  args = "install"
}

action "test" {
  uses = "actions/npm@3c8332795d5443adc712d30fa147db61fd520b5a"
  runs = "npm"
  args = "test"
  needs = ["npm install"]
}
