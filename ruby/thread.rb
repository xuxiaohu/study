class TestThread
  attr_accessor :thread_pool

  def initialize
    @thread_pool = []
    
  end
  
  def run
    until @thread_pool.empty?
      Thread.new do
        puts @thread_pool.inspect
      end
    end
  end

  def push(*item)
    @thread_pool << item
  end
  
end

thread = TestThread.new
thread.run
thread.push(11, 22)
