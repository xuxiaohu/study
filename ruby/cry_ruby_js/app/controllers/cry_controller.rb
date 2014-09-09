class CryController < ApplicationController
	require "openssl"
  require "digest"

	def index
		puts "----------------------"
    @secrate = aes128_encrypt("12345678901234567890123456789012", "test`~!{^&()_+-={[}]|\:;'<,>.?/'}} encrypt\n12121212")
    #puts [@secrate].pack("m0").gsub(/\n/, '')
    @secrate = Base64.strict_encode64(@secrate)
    puts "*********"
    puts "*********"
    puts @secrate
    #puts aes256_decrypt("12345678901234567890123456789012345678901234567890", @secrate)
	end

	def aes128_encrypt(key,data)
		#iv = Base64.decode64("kT+uMuPwUk2LH4cFbK0GiA==")
		#must 32 bits
		key = ["12345678901234567890123456789012"].pack("H*")
		@key = key
		aes = OpenSSL::Cipher.new('AES-128-CBC')
		#aes = OpenSSL::Cipher::Cipher.new("AES-128-CBC")
		aes.encrypt
		aes.key = key
		#aes.iv = iv
		aes.update(data) + aes.final
	end

	def aes128_decrypt(key,data)
		key = Digest::SHA256.digest(key) if(key.kind_of?(String) && 32 != key.bytesize)
		aes = OpenSSL::Cipher.new('AES-128-CBC')
		aes.decrypt
		aes.key = key
		aes.update(data) + aes.final
	end

  def aaa
  end
end
