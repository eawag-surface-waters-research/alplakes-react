//
//  GNJavascriptRunner.h
//  Pods
//
//  Created by Hunaid Hassan on 07.07.21.
//

#import <Foundation/Foundation.h>

@protocol GNJavascriptRunner;

@protocol GNJavascriptRunner<NSObject>

- (void)handleJsNavigationUrl:(NSString *)url;
- (void)loadUrl:(NSURL *)url;
- (void)runJavascript:(NSString *)script;
- (void)runJavascriptWithCallback:(id)callback data:(NSDictionary *)data;
- (void)triggerEvent:(NSString *)eventName data:(NSDictionary *)data;

@end
