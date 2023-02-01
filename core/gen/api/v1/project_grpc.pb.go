// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.2.0
// - protoc             (unknown)
// source: api/v1/project.proto

package project

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

// ProjectServiceClient is the client API for ProjectService service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type ProjectServiceClient interface {
	GenerateCode(ctx context.Context, in *GenerateCodeRequest, opts ...grpc.CallOption) (ProjectService_GenerateCodeClient, error)
	GenerateCodeWithOpenApi(ctx context.Context, in *GenerateCodeWithOpenApiRequest, opts ...grpc.CallOption) (ProjectService_GenerateCodeWithOpenApiClient, error)
	RegenerateCode(ctx context.Context, in *GenerateCodeRequest, opts ...grpc.CallOption) (ProjectService_RegenerateCodeClient, error)
}

type projectServiceClient struct {
	cc grpc.ClientConnInterface
}

func NewProjectServiceClient(cc grpc.ClientConnInterface) ProjectServiceClient {
	return &projectServiceClient{cc}
}

func (c *projectServiceClient) GenerateCode(ctx context.Context, in *GenerateCodeRequest, opts ...grpc.CallOption) (ProjectService_GenerateCodeClient, error) {
	stream, err := c.cc.NewStream(ctx, &ProjectService_ServiceDesc.Streams[0], "/api.v1.ProjectService/GenerateCode", opts...)
	if err != nil {
		return nil, err
	}
	x := &projectServiceGenerateCodeClient{stream}
	if err := x.ClientStream.SendMsg(in); err != nil {
		return nil, err
	}
	if err := x.ClientStream.CloseSend(); err != nil {
		return nil, err
	}
	return x, nil
}

type ProjectService_GenerateCodeClient interface {
	Recv() (*GenerateCodeResponse, error)
	grpc.ClientStream
}

type projectServiceGenerateCodeClient struct {
	grpc.ClientStream
}

func (x *projectServiceGenerateCodeClient) Recv() (*GenerateCodeResponse, error) {
	m := new(GenerateCodeResponse)
	if err := x.ClientStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

func (c *projectServiceClient) GenerateCodeWithOpenApi(ctx context.Context, in *GenerateCodeWithOpenApiRequest, opts ...grpc.CallOption) (ProjectService_GenerateCodeWithOpenApiClient, error) {
	stream, err := c.cc.NewStream(ctx, &ProjectService_ServiceDesc.Streams[1], "/api.v1.ProjectService/GenerateCodeWithOpenApi", opts...)
	if err != nil {
		return nil, err
	}
	x := &projectServiceGenerateCodeWithOpenApiClient{stream}
	if err := x.ClientStream.SendMsg(in); err != nil {
		return nil, err
	}
	if err := x.ClientStream.CloseSend(); err != nil {
		return nil, err
	}
	return x, nil
}

type ProjectService_GenerateCodeWithOpenApiClient interface {
	Recv() (*GenerateCodeWithOpenApiResponse, error)
	grpc.ClientStream
}

type projectServiceGenerateCodeWithOpenApiClient struct {
	grpc.ClientStream
}

func (x *projectServiceGenerateCodeWithOpenApiClient) Recv() (*GenerateCodeWithOpenApiResponse, error) {
	m := new(GenerateCodeWithOpenApiResponse)
	if err := x.ClientStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

func (c *projectServiceClient) RegenerateCode(ctx context.Context, in *GenerateCodeRequest, opts ...grpc.CallOption) (ProjectService_RegenerateCodeClient, error) {
	stream, err := c.cc.NewStream(ctx, &ProjectService_ServiceDesc.Streams[2], "/api.v1.ProjectService/RegenerateCode", opts...)
	if err != nil {
		return nil, err
	}
	x := &projectServiceRegenerateCodeClient{stream}
	if err := x.ClientStream.SendMsg(in); err != nil {
		return nil, err
	}
	if err := x.ClientStream.CloseSend(); err != nil {
		return nil, err
	}
	return x, nil
}

type ProjectService_RegenerateCodeClient interface {
	Recv() (*GenerateCodeResponse, error)
	grpc.ClientStream
}

type projectServiceRegenerateCodeClient struct {
	grpc.ClientStream
}

func (x *projectServiceRegenerateCodeClient) Recv() (*GenerateCodeResponse, error) {
	m := new(GenerateCodeResponse)
	if err := x.ClientStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

// ProjectServiceServer is the server API for ProjectService service.
// All implementations should embed UnimplementedProjectServiceServer
// for forward compatibility
type ProjectServiceServer interface {
	GenerateCode(*GenerateCodeRequest, ProjectService_GenerateCodeServer) error
	GenerateCodeWithOpenApi(*GenerateCodeWithOpenApiRequest, ProjectService_GenerateCodeWithOpenApiServer) error
	RegenerateCode(*GenerateCodeRequest, ProjectService_RegenerateCodeServer) error
}

// UnimplementedProjectServiceServer should be embedded to have forward compatible implementations.
type UnimplementedProjectServiceServer struct {
}

func (UnimplementedProjectServiceServer) GenerateCode(*GenerateCodeRequest, ProjectService_GenerateCodeServer) error {
	return status.Errorf(codes.Unimplemented, "method GenerateCode not implemented")
}
func (UnimplementedProjectServiceServer) GenerateCodeWithOpenApi(*GenerateCodeWithOpenApiRequest, ProjectService_GenerateCodeWithOpenApiServer) error {
	return status.Errorf(codes.Unimplemented, "method GenerateCodeWithOpenApi not implemented")
}
func (UnimplementedProjectServiceServer) RegenerateCode(*GenerateCodeRequest, ProjectService_RegenerateCodeServer) error {
	return status.Errorf(codes.Unimplemented, "method RegenerateCode not implemented")
}

// UnsafeProjectServiceServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to ProjectServiceServer will
// result in compilation errors.
type UnsafeProjectServiceServer interface {
	mustEmbedUnimplementedProjectServiceServer()
}

func RegisterProjectServiceServer(s grpc.ServiceRegistrar, srv ProjectServiceServer) {
	s.RegisterService(&ProjectService_ServiceDesc, srv)
}

func _ProjectService_GenerateCode_Handler(srv interface{}, stream grpc.ServerStream) error {
	m := new(GenerateCodeRequest)
	if err := stream.RecvMsg(m); err != nil {
		return err
	}
	return srv.(ProjectServiceServer).GenerateCode(m, &projectServiceGenerateCodeServer{stream})
}

type ProjectService_GenerateCodeServer interface {
	Send(*GenerateCodeResponse) error
	grpc.ServerStream
}

type projectServiceGenerateCodeServer struct {
	grpc.ServerStream
}

func (x *projectServiceGenerateCodeServer) Send(m *GenerateCodeResponse) error {
	return x.ServerStream.SendMsg(m)
}

func _ProjectService_GenerateCodeWithOpenApi_Handler(srv interface{}, stream grpc.ServerStream) error {
	m := new(GenerateCodeWithOpenApiRequest)
	if err := stream.RecvMsg(m); err != nil {
		return err
	}
	return srv.(ProjectServiceServer).GenerateCodeWithOpenApi(m, &projectServiceGenerateCodeWithOpenApiServer{stream})
}

type ProjectService_GenerateCodeWithOpenApiServer interface {
	Send(*GenerateCodeWithOpenApiResponse) error
	grpc.ServerStream
}

type projectServiceGenerateCodeWithOpenApiServer struct {
	grpc.ServerStream
}

func (x *projectServiceGenerateCodeWithOpenApiServer) Send(m *GenerateCodeWithOpenApiResponse) error {
	return x.ServerStream.SendMsg(m)
}

func _ProjectService_RegenerateCode_Handler(srv interface{}, stream grpc.ServerStream) error {
	m := new(GenerateCodeRequest)
	if err := stream.RecvMsg(m); err != nil {
		return err
	}
	return srv.(ProjectServiceServer).RegenerateCode(m, &projectServiceRegenerateCodeServer{stream})
}

type ProjectService_RegenerateCodeServer interface {
	Send(*GenerateCodeResponse) error
	grpc.ServerStream
}

type projectServiceRegenerateCodeServer struct {
	grpc.ServerStream
}

func (x *projectServiceRegenerateCodeServer) Send(m *GenerateCodeResponse) error {
	return x.ServerStream.SendMsg(m)
}

// ProjectService_ServiceDesc is the grpc.ServiceDesc for ProjectService service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var ProjectService_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "api.v1.ProjectService",
	HandlerType: (*ProjectServiceServer)(nil),
	Methods:     []grpc.MethodDesc{},
	Streams: []grpc.StreamDesc{
		{
			StreamName:    "GenerateCode",
			Handler:       _ProjectService_GenerateCode_Handler,
			ServerStreams: true,
		},
		{
			StreamName:    "GenerateCodeWithOpenApi",
			Handler:       _ProjectService_GenerateCodeWithOpenApi_Handler,
			ServerStreams: true,
		},
		{
			StreamName:    "RegenerateCode",
			Handler:       _ProjectService_RegenerateCode_Handler,
			ServerStreams: true,
		},
	},
	Metadata: "api/v1/project.proto",
}
