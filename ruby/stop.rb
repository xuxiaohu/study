require "eventmachine"

EM.run do
  EM.add_timer(10){EM.stop}
end

# the thread is stop 10seconds and then puts the string
puts "10seconds"
