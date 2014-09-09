require "eventmachine"
require "thread"
require "pry"

# EM.run do
#   EM.add_timer(2) do
#     puts "Main #{Thread.current}"
#     EM.stop_event_loop
#   end
#   EM.defer do
#     puts "Defer #{Thread.current}"
#   end
# end

EM.run do  
  op = proc do  
    2+2  
  end  
  callback = proc do |count|  
    binding.pry
    puts "2 + 2 == #{count}"  
    EM.stop  
  end  
  EM.defer(op, callback)  
end  
