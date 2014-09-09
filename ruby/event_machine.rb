require 'rubygems'
require 'eventmachine'

# module EchoServer 
#   def receive_data(data)
#     send_data(data)
#   end
# end

# EventMachine::run do
#   host = '127.0.0.1'
#   port = 8080
#   EventMachine::start_server host, port, EchoServer
#   puts "Started EchoServer on #{host}:#{port}..."
# end

module HttpHeaders
	def post_init
		send_data "Get /\r\n\r\n"
		@data = ""
	end

	def receive_data(data)
		@data << data
	end

	def unbind
		if @data =~ /[\n][\r]*[\n]/
			$`.each {|line| puts ">>>#{line}" }
		end

		EventMachine::stop_event_loop
	end

	EventMachine::run do
		EventMachine::connect 'http://ltech.fnst.cn.fujitsu.com/tsd/', 80, HttpHeaders
	end
end