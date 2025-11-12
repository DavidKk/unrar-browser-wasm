cmake_minimum_required(VERSION 3.12)
project(unrar-wasm)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_EXECUTABLE_SUFFIX ".js")

# 添加编译定义
add_definitions(-D_UNIX -DRARDLL -DNOCRYPT -DNOVOLUME -DSILENT -DRAR_NOCRYPT)

include_directories(vendor/unrar)

add_executable(unrar
  src/unrar.cpp
  vendor/unrar/rar.cpp
  vendor/unrar/strlist.cpp
  vendor/unrar/strfn.cpp
  vendor/unrar/pathfn.cpp
  vendor/unrar/smallfn.cpp
  vendor/unrar/global.cpp
  vendor/unrar/file.cpp
  vendor/unrar/filefn.cpp
  vendor/unrar/filcreat.cpp
  vendor/unrar/archive.cpp
  vendor/unrar/arcread.cpp
  vendor/unrar/unicode.cpp
  vendor/unrar/system.cpp
  vendor/unrar/rawread.cpp
  vendor/unrar/encname.cpp
  vendor/unrar/resource.cpp
  vendor/unrar/match.cpp
  vendor/unrar/timefn.cpp
  vendor/unrar/rdwrfn.cpp
  vendor/unrar/options.cpp
  vendor/unrar/errhnd.cpp
  vendor/unrar/rarvm.cpp
  vendor/unrar/secpassword.cpp
  vendor/unrar/getbits.cpp
  vendor/unrar/sha1.cpp
  vendor/unrar/sha256.cpp
  vendor/unrar/blake2s.cpp
  vendor/unrar/hash.cpp
  vendor/unrar/extinfo.cpp
  vendor/unrar/extract.cpp
  vendor/unrar/volume.cpp
  vendor/unrar/list.cpp
  vendor/unrar/find.cpp
  vendor/unrar/unpack.cpp
  vendor/unrar/cmddata.cpp
  vendor/unrar/dll.cpp
  vendor/unrar/crypt.cpp
  vendor/unrar/filestr.cpp
  vendor/unrar/threadpool.cpp
  vendor/unrar/largepage.cpp
  vendor/unrar/qopen.cpp
  vendor/unrar/consio.cpp
  vendor/unrar/ui.cpp
  vendor/unrar/crc.cpp
  vendor/unrar/headers.cpp
)

set_target_properties(unrar PROPERTIES
  LINK_FLAGS "--bind -s MODULARIZE=1 -s ALLOW_MEMORY_GROWTH=1 -s ENVIRONMENT=web,node -s NO_DISABLE_EXCEPTION_CATCHING -s FORCE_FILESYSTEM=1 -s EXPORTED_RUNTIME_METHODS='[\"FS\"]' -s ASSERTIONS=1"
)