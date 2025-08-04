//
//  GNDefines.h
//  Pods
//
//  Created by Hunaid Hassan on 21.06.21.
//

#if __OBJC__
#  import <Foundation/Foundation.h>
#endif

#if defined(__cplusplus)
#define GN_EXTERN extern "C" __attribute__((visibility("default")))
#define GN_EXTERN_C_BEGIN extern "C" {
#define GN_EXTERN_C_END }
#else
#define GN_EXTERN extern __attribute__((visibility("default")))
#define GN_EXTERN_C_BEGIN
#define GN_EXTERN_C_END
#endif
