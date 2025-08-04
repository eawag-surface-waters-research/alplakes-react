//
//  GNUtilities.h
//  GoNativeCore
//
//  Created by Hunaid Hassan on 18.10.21.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface GNUtilities : NSObject

+(NSDictionary*)parseQueryParamsWithUrl:(NSURL*)url;
+(UIColor *)colorFromHexString:(NSString *)hexString;
+(BOOL)url:(NSString *)url1 matchesUrl:(NSString *)url2;

@end

NS_ASSUME_NONNULL_END
