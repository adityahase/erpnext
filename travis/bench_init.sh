#!/bin/bash

cd ~/
bench init frappe-bench --frappe-path https://github.com/adityahase/frappe.git --frappe-branch coverage-local --python $(which python)
