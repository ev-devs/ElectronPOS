
#!/usr/bin/expect
set pass "mysecret"

spawn /usr/bin/passwd

expect "password: "
send "$pass"
expect "password: "
send "$pass"

