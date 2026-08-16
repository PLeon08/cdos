# Bootstrap and Environment System specification

Bootstrap turns a clone into a safe local CDOS environment: it detects prerequisites, creates validated configuration, initializes storage, registers local components, and runs `doctor`. Environment management keeps workspace, profile, provider endpoints, and state boundaries explicit. Bootstrap must never silently install a privileged integration or generate real secrets.

