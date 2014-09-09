require 'socket'
require 'fcntl'

@loopbreak_reader = UDPSocket.new
@loopbreak_reader2 = UDPSocket.new
puts Fcntl::F_SETFL
puts Fcntl::O_NONBLOCK
puts @loopbreak_reader2.fileno
@loopbreak_writer = UDPSocket.new
puts @loopbreak_writer.fileno
@loopbreak_reader.bind("127.0.0.1", 45480)
@loopbreak_writer.connect("127.0.0.1", 45480)
@loopbreak_writer.send("hello world", 0)
puts @loopbreak_reader.recvfrom_nonblock(100)
puts "---------"
