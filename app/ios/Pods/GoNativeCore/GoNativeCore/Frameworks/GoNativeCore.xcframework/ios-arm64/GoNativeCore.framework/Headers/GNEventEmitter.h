//
//  GNEventEmitter.h
//  GoNativeCore
//
//  Created by Hunaid Hassan on 07.07.21.
//

#import <Foundation/Foundation.h>
#import "GNBridgeModule.h"
#import "GNBridge.h"

NS_ASSUME_NONNULL_BEGIN

@interface GNEventEmitter : NSObject<GNBridgeModule>

@property (nonatomic, weak) GNBridge *bridge;

- (NSString *)createJSForCallback:(NSString *)name, ... NS_REQUIRES_NIL_TERMINATION;
- (NSString *)createJSForCallback:(NSString *)name params:(NSArray *)args;

@end

NS_ASSUME_NONNULL_END
